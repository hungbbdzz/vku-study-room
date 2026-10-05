import { supabase } from './supabase';
import { StudentSession } from '../types/booking';

/**
 * Single official guest account for quick testing / grading without registration
 */
export const GUEST_ACCOUNT: StudentSession = {
  name: 'Khách Trải Nghiệm (Guest Demo)',
  studentId: 'GUEST',
  studentClass: 'VKU-DEMO',
  email: 'guest@vku.udn.vn',
  faculty: 'Khách tham quan & chấm điểm',
  role: 'student',
  avatar: '👤',
  authProvider: 'email',
};

export interface AuthResult {
  success: boolean;
  session?: StudentSession;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  studentClass?: string;
  faculty?: string;
}

/**
 * Real registration in Supabase Auth backend.
 * Sends genuine email confirmation link to user's inbox!
 */
export async function signUpWithSupabase(params: SignUpParams): Promise<AuthResult> {
  const email = params.email.trim().toLowerCase();
  const password = params.password.trim();
  const name = params.name.trim();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Địa chỉ Email không hợp lệ (cần chứa ký tự @).' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  if (!name) {
    return { success: false, error: 'Vui lòng nhập họ và tên của bạn.' };
  }

  const defaultId = params.studentId?.trim() || email.split('@')[0].toUpperCase();
  const defaultClass = params.studentClass?.trim() || 'VKU-2022';
  const defaultFaculty = params.faculty?.trim() || 'Khoa Khoa học Máy tính';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
          studentId: defaultId,
          studentClass: defaultClass,
          faculty: defaultFaculty,
          role: 'student',
          avatar: '👨‍🎓',
        },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        return {
          success: false,
          error: 'Email này đã được đăng ký trên Supabase. Vui lòng chuyển sang tab Đăng nhập.',
        };
      }
      return { success: false, error: error.message };
    }

    // If identities array is empty, user already registered
    if (data.user?.identities && data.user.identities.length === 0) {
      return {
        success: false,
        error: 'Email này đã được đăng ký trước đó. Vui lòng chuyển sang tab Đăng nhập.',
      };
    }

    return {
      success: true,
      needsEmailConfirmation: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Lỗi khi gửi yêu cầu đăng ký tới Supabase.',
    };
  }
}

/**
 * Sign in using real Supabase Auth backend with email and password.
 */
export async function signInWithSupabaseEmail(
  rawInput: string,
  password = 'password123'
): Promise<AuthResult> {
  const input = rawInput.trim();
  let email = input.toLowerCase();

  // If user enters MSSV without @, map to VKU domain
  if (!email.includes('@')) {
    email = `${email}@vku.udn.vn`;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: `Tài khoản ${email} chưa được kích hoạt qua email! Vui lòng mở hộp thư email (kiểm tra cả thư mục Spam/Rác) và nhấn vào liên kết xác thực để kích hoạt tài khoản trước khi đăng nhập.`,
        };
      }
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return { success: false, error: 'Không tìm thấy thông tin tài khoản trên Supabase.' };
    }

    const metadata = data.user.user_metadata || {};
    const fallbackId = email.split('@')[0].toUpperCase();

    const session: StudentSession = {
      name: metadata.name || metadata.full_name || fallbackId,
      studentId: metadata.studentId || fallbackId,
      studentClass: metadata.studentClass || 'VKU',
      email: data.user.email,
      faculty: metadata.faculty || 'Khoa Khoa học Máy tính',
      role: metadata.role || 'student',
      avatar: metadata.avatar || '👤',
      authProvider: 'email',
      supabaseUserId: data.user.id,
    };

    return {
      success: true,
      session,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Lỗi kết nối tới Supabase Auth.',
    };
  }
}

/**
 * Instant login with the single official Guest demo account
 */
export async function signInGuest(): Promise<AuthResult> {
  return signInWithSupabaseEmail('guest@vku.udn.vn', 'password123');
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
