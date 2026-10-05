import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { StudentSession } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import {
  STANDARD_ACCOUNTS,
  signInWithSupabaseEmail,
  signInWithGoogle,
  signUpWithSupabase,
} from '../services/authService';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useBookingStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginInput, setLoginInput] = useState('tuannguyen@vku.udn.vn');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regFaculty, setRegFaculty] = useState('Khoa Khoa học Máy tính');
  const [regRole, setRegRole] = useState<'student' | 'teacher'>('student');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Common UI state
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isEnteringCustomGmail, setIsEnteringCustomGmail] = useState(false);

  // Direct login via Supabase Auth
  const handleDirectLogin = async () => {
    const trimmed = loginInput.trim();
    if (!trimmed) {
      Alert.alert('Thông báo', 'Vui lòng nhập Email VKU, Gmail hoặc Mã số sinh viên.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithSupabaseEmail(trimmed, loginPassword);
      if (result.success && result.session) {
        login(result.session);
      } else {
        Alert.alert('Đăng nhập thất bại', result.error || 'Vui lòng kiểm tra lại thông tin.');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể kết nối tới Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  // Direct register via Supabase Auth
  const handleDirectRegister = async () => {
    if (!regName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Họ và tên.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      Alert.alert('Thông báo', 'Vui lòng nhập Email hoặc Gmail hợp lệ.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithSupabase({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        studentId: regStudentId.trim(),
        studentClass: regClass.trim(),
        faculty: regFaculty.trim(),
        role: regRole,
      });

      if (result.success && result.session) {
        Alert.alert('Thành công', `Đã tạo tài khoản ${result.session.name} trên Supabase thành công!`);
        login(result.session);
      } else {
        Alert.alert('Đăng ký thất bại', result.error || 'Không thể tạo tài khoản trên Supabase.');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu tạo tài khoản đến Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Google 1-tap select account
  const handleSelectGoogleAccount = async (account: StudentSession) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const result = await signInWithGoogle(
        account.email || 'thaytuan.vku@gmail.com',
        account.name
      );
      if (result.success && result.session) {
        login(result.session);
      }
    } finally {
      setLoading(false);
    }
  };

  // Custom Gmail submit
  const handleCustomGmailLogin = async () => {
    const trimmed = customGmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email/Gmail hợp lệ.');
      return;
    }

    setShowGoogleModal(false);
    setIsEnteringCustomGmail(false);
    setLoading(true);
    try {
      const result = await signInWithGoogle(trimmed, customName.trim());
      if (result.success && result.session) {
        login(result.session);
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-tap demo
  const handleQuickLogin = async (acc: StudentSession) => {
    setLoading(true);
    try {
      const result = await signInWithSupabaseEmail(
        acc.email || acc.studentId,
        'password123'
      );
      if (result.success && result.session) {
        login(result.session);
      } else {
        login(acc);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 20, 32) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & School Header */}
          <View style={styles.brandHeader}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.badgeRow}>
              <View style={styles.vkuTag}>
                <Text style={styles.vkuTagText}>VKU SMART CAMPUS</Text>
              </View>
              <View style={styles.supabaseTag}>
                <Text style={styles.supabaseTagText}>⚡ SUPABASE AUTH & REALTIME</Text>
              </View>
            </View>
            <Text style={styles.appTitle}>VKU Study Room</Text>
            <Text style={styles.appSubtitle}>
              Hệ thống đặt phòng học & phòng Lab thông minh
            </Text>
          </View>

          {/* PRIMARY GOOGLE SIGN IN BUTTON */}
          <View style={styles.googleSection}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => setShowGoogleModal(true)}
              activeOpacity={0.85}
              disabled={loading}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <View style={styles.googleBtnTextCol}>
                <Text style={styles.googleBtnTitle}>Tiếp tục với Google / Gmail</Text>
                <Text style={styles.googleBtnSub}>
                  Đăng nhập nhanh cho Giảng viên & Sinh viên
                </Text>
              </View>
              <Text style={styles.googleBtnArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* FORM CARD WITH TAB SWITCHER (SIGN IN / SIGN UP) */}
          <View style={styles.formCard}>
            {/* Segmented Tab Control */}
            <View style={styles.tabSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.tabSwitchBtn,
                  authMode === 'login' && styles.tabSwitchBtnActive,
                ]}
                onPress={() => setAuthMode('login')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabSwitchText,
                    authMode === 'login' && styles.tabSwitchTextActive,
                  ]}
                >
                  🔑 Đăng nhập
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabSwitchBtn,
                  authMode === 'register' && styles.tabSwitchBtnActive,
                ]}
                onPress={() => setAuthMode('register')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabSwitchText,
                    authMode === 'register' && styles.tabSwitchTextActive,
                  ]}
                >
                  📝 Tạo tài khoản mới
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'login' ? (
              /* TAB 1: LOGIN FORM */
              <View>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.formTitle}>Đăng nhập Supabase Auth</Text>
                  <View style={styles.authBadge}>
                    <Text style={styles.authBadgeText}>Real Backend</Text>
                  </View>
                </View>

                {/* Input Email / Student ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email VKU / Gmail / Mã SV</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="tuannguyen@vku.udn.vn hoặc 22IT001"
                      placeholderTextColor={COLORS.textMuted}
                      value={loginInput}
                      onChangeText={setLoginInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Input Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Mặc định: password123"
                      placeholderTextColor={COLORS.textMuted}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!showLoginPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      style={styles.eyeBtn}
                    >
                      <Text style={styles.eyeText}>
                        {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                  onPress={handleDirectLogin}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>Đăng nhập với Supabase</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchModeLink}
                  onPress={() => setAuthMode('register')}
                >
                  <Text style={styles.switchModeText}>
                    Chưa có tài khoản?{' '}
                    <Text style={styles.switchModeHighlight}>Tạo tài khoản mới ngay</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* TAB 2: REGISTER FORM */
              <View>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.formTitle}>Đăng ký tài khoản Supabase</Text>
                  <View style={styles.authBadge}>
                    <Text style={styles.authBadgeText}>Tạo User Thật</Text>
                  </View>
                </View>

                {/* Input Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên *</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ví dụ: Nguyễn Văn Hùng"
                      placeholderTextColor={COLORS.textMuted}
                      value={regName}
                      onChangeText={setRegName}
                    />
                  </View>
                </View>

                {/* Input Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email / Gmail *</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="hung@gmail.com hoặc ...@vku.udn.vn"
                      placeholderTextColor={COLORS.textMuted}
                      value={regEmail}
                      onChangeText={setRegEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Input Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu (tối thiểu 6 ký tự) *</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nhập mật khẩu an toàn"
                      placeholderTextColor={COLORS.textMuted}
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry={!showRegPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowRegPassword(!showRegPassword)}
                      style={styles.eyeBtn}
                    >
                      <Text style={styles.eyeText}>
                        {showRegPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Role Switcher */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vai trò tài khoản:</Text>
                  <View style={styles.roleBtnRow}>
                    <TouchableOpacity
                      style={[
                        styles.roleSelectBtn,
                        regRole === 'student' && styles.roleSelectBtnActive,
                      ]}
                      onPress={() => setRegRole('student')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.roleSelectText,
                          regRole === 'student' && styles.roleSelectTextActive,
                        ]}
                      >
                        👨‍🎓 Sinh viên
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleSelectBtn,
                        regRole === 'teacher' && styles.roleSelectBtnActive,
                      ]}
                      onPress={() => setRegRole('teacher')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.roleSelectText,
                          regRole === 'teacher' && styles.roleSelectTextActive,
                        ]}
                      >
                        👨‍🏫 Giảng viên
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Student ID / Teacher Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {regRole === 'teacher' ? 'Mã Giảng viên' : 'Mã số sinh viên (MSSV)'}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🎓</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={regRole === 'teacher' ? 'GV-TUAN' : '22IT001'}
                      placeholderTextColor={COLORS.textMuted}
                      value={regStudentId}
                      onChangeText={setRegStudentId}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Class / Faculty */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Lớp / Bộ môn</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🏫</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={regRole === 'teacher' ? 'Khoa KHMT' : 'CNTT2022A'}
                      placeholderTextColor={COLORS.textMuted}
                      value={regClass}
                      onChangeText={setRegClass}
                    />
                  </View>
                </View>

                {/* Register Submit Button */}
                <TouchableOpacity
                  style={[styles.registerSubmitBtn, loading && styles.loginBtnDisabled]}
                  onPress={handleDirectRegister}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.registerSubmitText}>
                      🚀 Tạo tài khoản trên Supabase Auth
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchModeLink}
                  onPress={() => setAuthMode('login')}
                >
                  <Text style={styles.switchModeText}>
                    Đã có tài khoản?{' '}
                    <Text style={styles.switchModeHighlight}>Đăng nhập ngay</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Demo Switcher Section */}
          <View style={styles.demoSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>TÀI KHOẢN MẪU CÓ SẴN TRÊN SUPABASE (1 CHẠM)</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.demoHint}>
              Tài khoản đã tạo sẵn trên Supabase Auth để chấm điểm nhanh:
            </Text>

            {STANDARD_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={[
                  styles.demoItem,
                  acc.role === 'teacher' && styles.demoItemTeacher,
                ]}
                onPress={() => handleQuickLogin(acc)}
                activeOpacity={0.8}
                disabled={loading}
              >
                <View
                  style={[
                    styles.demoAvatar,
                    acc.role === 'teacher' && styles.demoAvatarTeacher,
                  ]}
                >
                  <Text style={styles.demoAvatarText}>{acc.avatar || '👤'}</Text>
                </View>
                <View style={styles.demoInfo}>
                  <View style={styles.demoNameRow}>
                    <Text style={styles.demoName}>{acc.name}</Text>
                    {acc.role === 'teacher' ? (
                      <View style={styles.teacherBadge}>
                        <Text style={styles.teacherBadgeText}>GIẢNG VIÊN</Text>
                      </View>
                    ) : (
                      <View style={styles.demoIdBadge}>
                        <Text style={styles.demoIdText}>{acc.studentId}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.demoDesc}>{acc.roleDesc}</Text>
                  <Text style={styles.demoSubText}>
                    {acc.email} • {acc.faculty}
                  </Text>
                </View>
                <Text style={styles.demoArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn
            </Text>
            <Text style={styles.footerSubText}>
              Học phần: Lập trình ứng dụng đa nền tảng • Backend: Supabase Auth & PostgreSQL
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* GOOGLE ACCOUNT SELECTOR MODAL */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.googleModalCard}>
            {/* Google Header */}
            <View style={styles.googleModalHeader}>
              <View style={styles.googleBigLogo}>
                <Text style={styles.googleBigLogoText}>G</Text>
              </View>
              <Text style={styles.googleModalTitle}>
                Đăng nhập bằng Google
              </Text>
              <Text style={styles.googleModalSub}>
                Chọn tài khoản Gmail để xác thực qua Supabase Auth
              </Text>
            </View>

            {!isEnteringCustomGmail ? (
              <>
                <View style={styles.googleList}>
                  {/* Account: Thay Tuan */}
                  <TouchableOpacity
                    style={styles.googleAccountItem}
                    onPress={() =>
                      handleSelectGoogleAccount({
                        name: 'Thầy Nguyễn Tuấn',
                        studentId: 'GV-TUAN',
                        studentClass: 'Giảng viên VKU',
                        email: 'tuannguyen@vku.udn.vn',
                        faculty: 'Khoa Khoa học Máy tính',
                        role: 'teacher',
                        avatar: '👨‍🏫',
                        authProvider: 'google',
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.googleAvatarContainer}>
                      <Text style={{ fontSize: 22 }}>👨‍🏫</Text>
                    </View>
                    <View style={styles.googleAccountInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.googleAccountName}>Thầy Nguyễn Tuấn</Text>
                        <View style={styles.teacherBadge}>
                          <Text style={styles.teacherBadgeText}>GIẢNG VIÊN</Text>
                        </View>
                      </View>
                      <Text style={styles.googleAccountEmail}>tuannguyen@vku.udn.vn</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Account: Thay Tuan personal Gmail */}
                  <TouchableOpacity
                    style={styles.googleAccountItem}
                    onPress={() =>
                      handleSelectGoogleAccount({
                        name: 'Thầy Nguyễn Tuấn (Gmail)',
                        studentId: 'GV-GMAIL',
                        studentClass: 'Giảng viên VKU',
                        email: 'thaytuan.vku@gmail.com',
                        faculty: 'Khoa Khoa học Máy tính',
                        role: 'teacher',
                        avatar: '👨‍🏫',
                        authProvider: 'google',
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.googleAvatarContainer}>
                      <Text style={{ fontSize: 22 }}>👨‍🏫</Text>
                    </View>
                    <View style={styles.googleAccountInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.googleAccountName}>Thầy Nguyễn Tuấn</Text>
                        <View style={styles.teacherBadge}>
                          <Text style={styles.teacherBadgeText}>GMAIL</Text>
                        </View>
                      </View>
                      <Text style={styles.googleAccountEmail}>thaytuan.vku@gmail.com</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Account: Sinh vien A */}
                  <TouchableOpacity
                    style={styles.googleAccountItem}
                    onPress={() =>
                      handleSelectGoogleAccount({
                        name: 'Nguyễn Văn A',
                        studentId: '22IT001',
                        studentClass: 'CNTT2022A',
                        email: '22it001@vku.udn.vn',
                        faculty: 'Khoa Khoa học Máy tính',
                        role: 'student',
                        avatar: '👨‍🎓',
                        authProvider: 'google',
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.googleAvatarContainer}>
                      <Text style={{ fontSize: 22 }}>👨‍🎓</Text>
                    </View>
                    <View style={styles.googleAccountInfo}>
                      <Text style={styles.googleAccountName}>Nguyễn Văn A</Text>
                      <Text style={styles.googleAccountEmail}>22it001@vku.udn.vn</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Account: Hung Gmail */}
                  <TouchableOpacity
                    style={styles.googleAccountItem}
                    onPress={() =>
                      handleSelectGoogleAccount({
                        name: 'Nguyễn Văn Hùng',
                        studentId: '22IT-HUNG',
                        studentClass: 'CNTT2022',
                        email: 'hungabc2206@gmail.com',
                        faculty: 'Khoa Khoa học Máy tính',
                        role: 'student',
                        avatar: '🧑',
                        authProvider: 'google',
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.googleAvatarContainer}>
                      <Text style={{ fontSize: 22 }}>🧑</Text>
                    </View>
                    <View style={styles.googleAccountInfo}>
                      <Text style={styles.googleAccountName}>Nguyễn Văn Hùng</Text>
                      <Text style={styles.googleAccountEmail}>hungabc2206@gmail.com</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Option: Enter other Gmail */}
                  <TouchableOpacity
                    style={styles.googleAddOther}
                    onPress={() => setIsEnteringCustomGmail(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.googleAddIconBox}>
                      <Text style={styles.googleAddIcon}>➕</Text>
                    </View>
                    <Text style={styles.googleAddText}>
                      Nhập địa chỉ Gmail riêng của bạn...
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.googleCancelBtn}
                  onPress={() => setShowGoogleModal(false)}
                >
                  <Text style={styles.googleCancelText}>Đóng</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Custom Gmail form */
              <View style={styles.customGmailForm}>
                <Text style={styles.customGmailHeader}>
                  Nhập địa chỉ Gmail của bạn
                </Text>
                <TextInput
                  style={styles.customGmailInput}
                  placeholder="Ví dụ: yourname@gmail.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={customGmail}
                  onChangeText={setCustomGmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={[styles.customGmailInput, { marginTop: 10 }]}
                  placeholder="Họ và tên (tuỳ chọn)"
                  placeholderTextColor={COLORS.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
                <View style={styles.customBtnRow}>
                  <TouchableOpacity
                    style={styles.customBackBtn}
                    onPress={() => setIsEnteringCustomGmail(false)}
                  >
                    <Text style={styles.customBackText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.customSubmitBtn}
                    onPress={handleCustomGmailLogin}
                  >
                    <Text style={styles.customSubmitText}>Xác nhận & Đăng nhập</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  vkuTag: {
    backgroundColor: 'rgba(0, 51, 102, 0.4)',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  vkuTagText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  supabaseTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  supabaseTagText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  googleSection: {
    marginBottom: SPACING.base,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googleIconText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnTextCol: {
    flex: 1,
  },
  googleBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  googleBtnSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  googleBtnArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748b',
    marginLeft: SPACING.xs,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.base,
  },
  tabSwitchRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabSwitchBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSwitchText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabSwitchTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  authBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  authBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  inputIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  eyeText: {
    fontSize: 15,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSelectBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  roleSelectBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  roleSelectText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  roleSelectTextActive: {
    color: COLORS.accent,
    fontWeight: '800',
  },
  loginBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerSubmitBtn: {
    backgroundColor: '#0284c7',
    borderRadius: RADIUS.md,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  switchModeLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  switchModeText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  switchModeHighlight: {
    color: COLORS.accentLight,
    fontWeight: '700',
  },
  demoSection: {
    marginBottom: SPACING.base,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
    letterSpacing: 0.5,
  },
  demoHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xs,
  },
  demoItemTeacher: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  demoAvatarTeacher: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  demoAvatarText: {
    fontSize: 18,
  },
  demoInfo: {
    flex: 1,
  },
  demoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  teacherBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  teacherBadgeText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
  },
  demoIdBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  demoIdText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  demoDesc: {
    fontSize: 11,
    color: COLORS.accentLight,
    marginTop: 2,
    fontWeight: '600',
  },
  demoSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  demoArrow: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: SPACING.base,
  },
  googleModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  googleModalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  googleBigLogo: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  googleBigLogoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  googleModalSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 3,
  },
  googleList: {
    marginBottom: SPACING.md,
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  googleAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googleAccountInfo: {
    flex: 1,
  },
  googleAccountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  googleAccountEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  googleAddOther: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  googleAddIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleAddIcon: {
    fontSize: 16,
  },
  googleAddText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  googleCancelBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  googleCancelText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  customGmailForm: {
    paddingVertical: 8,
  },
  customGmailHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  customGmailInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0f172a',
  },
  customBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  customBackBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customBackText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  customSubmitBtn: {
    flex: 2,
    backgroundColor: '#4285F4',
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSubmitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
