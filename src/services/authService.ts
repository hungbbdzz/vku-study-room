import { supabase } from './supabase';
import { StudentSession } from '../types/booking';

export const STANDARD_ACCOUNTS: Array<StudentSession & { roleDesc: string; defaultPassword?: string }> = [
  {
    name: 'Thầy Nguyễn Tuấn',
    studentId: 'GV-TUAN',
    studentClass: 'Giảng viên VKU',
    email: 'tuannguyen@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính',
    role: 'teacher',
    avatar: '👨‍🏫',
    authProvider: 'google',
    roleDesc: 'Giảng viên phụ trách môn học (Chấm điểm & Kiểm thử)',
    defaultPassword: 'password123',
  },
  {
    name: 'Thầy Nguyễn Tuấn (Gmail)',
    studentId: 'GV-GMAIL',
    studentClass: 'Giảng viên VKU',
    email: 'thaytuan.vku@gmail.com',
    faculty: 'Khoa Khoa học Máy tính',
    role: 'teacher',
    avatar: '👨‍🏫',
    authProvider: 'google',
    roleDesc: 'Tài khoản Google / Gmail Giảng viên',
    defaultPassword: 'password123',
  },
  {
    name: 'Nguyễn Văn A',
    studentId: '22IT001',
    studentClass: 'CNTT2022A',
    email: '22it001@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính',
    role: 'student',
    avatar: '👨‍🎓',
    authProvider: 'vku_id',
    roleDesc: 'Sinh viên A (Trưởng nhóm Lab)',
    defaultPassword: 'password123',
  },
  {
    name: 'Trần Thị B',
    studentId: '22IT002',
    studentClass: 'HTTT2022B',
    email: '22it002@vku.udn.vn',
    faculty: 'Khoa Hệ thống Thông tin',
    role: 'student',
    avatar: '👩‍🎓',
    authProvider: 'vku_id',
    roleDesc: 'Sinh viên B (Test Race Condition)',
    defaultPassword: 'password123',
  },
  {
    name: 'Lê Hoàng C',
    studentId: '22IT003',
    studentClass: 'ANTT2021',
    email: '22it003@vku.udn.vn',
    faculty: 'Khoa An toàn Thông tin',
    role: 'student',
    avatar: '👨‍🎓',
    authProvider: 'vku_id',
    roleDesc: 'Sinh viên C (Nghiên cứu sinh)',
    defaultPassword: 'password123',
  },
  {
    name: 'Nguyễn Văn Hùng',
    studentId: '22IT-HUNG',
    studentClass: 'CNTT2022',
    email: 'hungabc2206@gmail.com',
    faculty: 'Khoa Khoa học Máy tính',
    role: 'student',
    avatar: '🧑',
    authProvider: 'google',
    roleDesc: 'Tài khoản tác giả / Developer',
    defaultPassword: 'password123',
  },
];

export interface AuthResult {
  success: boolean;
  session?: StudentSession;
  error?: string;
  source?: 'supabase' | 'local_fallback';
}

/**
 * Sign in using Supabase Auth backend with an Email or Gmail address.
 * If user does not exist yet in Supabase Auth, automatically provision
 * the user record via admin API so the teacher can use any Gmail seamlessly.
 */
export async function signInWithSupabaseEmail(
  rawInput: string,
  password = 'password123'
): Promise<AuthResult> {
  const input = rawInput.trim();
  let email = input.toLowerCase();

  // If input is student ID like "22IT001", map to official VKU email
  if (!email.includes('@')) {
    email = `${email}@vku.udn.vn`;
  }

  const isTeacher =
    email.includes('tuan') ||
    email.includes('giangvien') ||
    email.includes('teacher');

  const isGmail = email.endsWith('@gmail.com');

  try {
    // 1. Try to sign in with Supabase Auth
    let { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // 2. If user not found, automatically register them in Supabase Auth backend
    if (signInError && (signInError.message.includes('Invalid login') || signInError.message.includes('not found'))) {
      const displayName = isTeacher
        ? 'Thầy Nguyễn Tuấn'
        : email.split('@')[0].toUpperCase();

      // Attempt admin create with auto confirmation
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name: displayName,
            role: isTeacher ? 'teacher' : 'student',
            faculty: 'Khoa Khoa học Máy tính',
            authProvider: isGmail ? 'google' : 'email',
          },
        });

      if (!createError && newUser?.user) {
        // Sign in now that user is created
        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        signInData = retry.data;
        signInError = retry.error;
      }
    }

    // 3. Match known standard account profile or construct from Supabase user
    const matchedStandard = STANDARD_ACCOUNTS.find(
      (acc) => acc.email?.toLowerCase() === email
    );

    const fallbackId = isTeacher
      ? 'GV-TUAN'
      : email.split('@')[0].toUpperCase();

    const session: StudentSession = {
      name:
        signInData?.user?.user_metadata?.name ||
        matchedStandard?.name ||
        (isTeacher ? 'Thầy Nguyễn Tuấn' : `Sinh viên ${fallbackId}`),
      studentId: matchedStandard?.studentId || fallbackId,
      studentClass:
        matchedStandard?.studentClass ||
        (isTeacher ? 'Giảng viên VKU' : 'CNTT-VKU'),
      email,
      faculty:
        matchedStandard?.faculty ||
        signInData?.user?.user_metadata?.faculty ||
        'Khoa Khoa học Máy tính',
      role: isTeacher ? 'teacher' : 'student',
      avatar: isTeacher ? '👨‍🏫' : isGmail ? '🧑' : '👨‍🎓',
      authProvider: isGmail ? 'google' : 'email',
      supabaseUserId: signInData?.user?.id || 'supabase-uid',
    };

    return {
      success: true,
      session,
      source: signInError ? 'local_fallback' : 'supabase',
    };
  } catch (err: any) {
    console.warn('[Supabase Auth] Falling back to offline session:', err);

    const fallbackId = isTeacher
      ? 'GV-TUAN'
      : email.split('@')[0].toUpperCase();

    return {
      success: true,
      session: {
        name: isTeacher ? 'Thầy Nguyễn Tuấn' : `Sinh viên ${fallbackId}`,
        studentId: fallbackId,
        studentClass: isTeacher ? 'Giảng viên VKU' : 'CNTT-VKU',
        email,
        faculty: 'Khoa Khoa học Máy tính',
        role: isTeacher ? 'teacher' : 'student',
        avatar: isTeacher ? '👨‍🏫' : '👨‍🎓',
        authProvider: isGmail ? 'google' : 'email',
      },
      source: 'local_fallback',
    };
  }
}

/**
 * Sign in specifically via Google / Gmail OAuth simulation or One-Tap.
 * Authenticates with Supabase backend and tags session with Google provider.
 */
export async function signInWithGoogle(
  email = 'thaytuan.vku@gmail.com',
  name = 'Thầy Nguyễn Tuấn'
): Promise<AuthResult> {
  const result = await signInWithSupabaseEmail(email);
  if (result.session) {
    result.session.authProvider = 'google';
    result.session.name = name || result.session.name;
    result.session.avatar = result.session.role === 'teacher' ? '👨‍🏫' : '🧑';
  }
  return result;
}

/**
 * Sign out from Supabase Auth backend
 */
export async function signOutSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase Auth] Error signing out:', err);
  }
}
