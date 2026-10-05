import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import {
  signInWithSupabaseEmail,
  signUpWithSupabase,
  signInGuest,
  GUEST_ACCOUNT,
} from '../services/authService';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useBookingStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regFaculty, setRegFaculty] = useState('Khoa Khoa học Máy tính');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // 1-Tap Guest Access
  const handleGuestLogin = async () => {
    setErrorNotice(null);
    setGuestLoading(true);
    try {
      const result = await signInGuest();
      if (result.success && result.session) {
        login(result.session);
      } else {
        // Fallback to offline guest session if Supabase network latency occurs
        login(GUEST_ACCOUNT);
      }
    } catch {
      login(GUEST_ACCOUNT);
    } finally {
      setGuestLoading(false);
    }
  };

  // Sign In via Supabase Email & Password
  const handleDirectLogin = async () => {
    setErrorNotice(null);
    const trimmed = loginInput.trim();
    if (!trimmed) {
      setErrorNotice('Vui lòng nhập Email hoặc Mã số sinh viên của bạn.');
      return;
    }
    if (!loginPassword) {
      setErrorNotice('Vui lòng nhập Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithSupabaseEmail(trimmed, loginPassword);
      if (result.success && result.session) {
        login(result.session);
      } else {
        setErrorNotice(result.error || 'Đăng nhập không thành công.');
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Không thể kết nối tới Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  // Register real account via Supabase Auth (sends real email confirmation)
  const handleDirectRegister = async () => {
    setErrorNotice(null);
    setSuccessNotice(null);

    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPassword;

    if (!name) {
      setErrorNotice('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorNotice('Vui lòng nhập địa chỉ Email thật hợp lệ để nhận mã xác nhận kích hoạt.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorNotice('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithSupabase({
        name,
        email,
        password,
        studentId: regStudentId.trim(),
        studentClass: regClass.trim(),
        faculty: regFaculty.trim(),
      });

      if (result.success) {
        setSuccessNotice(
          `Đăng ký tài khoản thành công! Hệ thống đã gửi một liên kết xác nhận kích hoạt tới email:\n\n👉 ${email}\n\nVui lòng mở hộp thư email (kiểm tra cả thư mục Spam / Thư rác) và nhấn vào liên kết xác thực trước khi đăng nhập.`
        );
        // Switch to login tab and prefill email
        setAuthMode('login');
        setLoginInput(email);
        setLoginPassword('');
        // Clear registration form
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegStudentId('');
        setRegClass('');
      } else {
        setErrorNotice(result.error || 'Đăng ký tài khoản thất bại.');
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Không thể gửi yêu cầu đăng ký tới Supabase Auth.');
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
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
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
                <Text style={styles.supabaseTagText}>⚡ SUPABASE AUTH</Text>
              </View>
            </View>
            <Text style={styles.appTitle}>VKU Study Room</Text>
            <Text style={styles.appSubtitle}>
              Hệ thống đặt phòng học & phòng Lab thông minh
            </Text>
          </View>

          {/* SINGLE OFFICIAL GUEST DEMO BUTTON */}
          <View style={styles.guestSection}>
            <View style={styles.guestCard}>
              <View style={styles.guestHeaderRow}>
                <View style={styles.guestIconCircle}>
                  <Text style={{ fontSize: 22 }}>👤</Text>
                </View>
                <View style={styles.guestTextCol}>
                  <Text style={styles.guestTitle}>Trải nghiệm Khách (Guest Demo)</Text>
                  <Text style={styles.guestSubtitle}>
                    Chấm điểm & kiểm thử nhanh các tính năng mà không cần đăng ký
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.guestBtn}
                onPress={handleGuestLogin}
                activeOpacity={0.85}
                disabled={loading || guestLoading}
              >
                {guestLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.guestBtnText}>⚡ Đăng nhập Khách (1 Chạm)</Text>
                    <Text style={styles.guestBtnArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC TÀI KHOẢN CÁ NHÂN</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* SUCCESS BANNER */}
          {successNotice && (
            <View style={styles.successBanner}>
              <View style={styles.bannerIconCol}>
                <Text style={{ fontSize: 24 }}>📬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.successBannerTitle}>Xác nhận Email kích hoạt</Text>
                <Text style={styles.successBannerBody}>{successNotice}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSuccessNotice(null)}
                style={styles.closeBannerBtn}
              >
                <Text style={styles.closeBannerText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ERROR BANNER */}
          {errorNotice && (
            <View style={styles.errorBanner}>
              <View style={styles.bannerIconCol}>
                <Text style={{ fontSize: 22 }}>⚠️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.errorBannerTitle}>Thông báo</Text>
                <Text style={styles.errorBannerBody}>{errorNotice}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setErrorNotice(null)}
                style={styles.closeBannerBtn}
              >
                <Text style={styles.closeBannerText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AUTH FORM CARD */}
          <View style={styles.formCard}>
            {/* Segmented Tab Switcher */}
            <View style={styles.tabSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.tabSwitchBtn,
                  authMode === 'login' && styles.tabSwitchBtnActive,
                ]}
                onPress={() => {
                  setErrorNotice(null);
                  setAuthMode('login');
                }}
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
                onPress={() => {
                  setErrorNotice(null);
                  setAuthMode('register');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabSwitchText,
                    authMode === 'register' && styles.tabSwitchTextActive,
                  ]}
                >
                  📝 Đăng ký tài khoản
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'login' ? (
              /* TAB 1: LOGIN */
              <View>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.formTitle}>Đăng nhập tài khoản</Text>
                  <View style={styles.authBadge}>
                    <Text style={styles.authBadgeText}>Supabase Auth</Text>
                  </View>
                </View>

                {/* Input Email / MSSV */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email hoặc Mã sinh viên</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="vd: student@vku.udn.vn hoặc 22IT001"
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
                      placeholder="Nhập mật khẩu của bạn"
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

                {/* Submit Login */}
                <TouchableOpacity
                  style={[styles.loginBtn, (loading || guestLoading) && styles.btnDisabled]}
                  onPress={handleDirectLogin}
                  activeOpacity={0.85}
                  disabled={loading || guestLoading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>🚀 Đăng nhập với Supabase</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchModeLink}
                  onPress={() => {
                    setErrorNotice(null);
                    setAuthMode('register');
                  }}
                >
                  <Text style={styles.switchModeText}>
                    Chưa có tài khoản?{' '}
                    <Text style={styles.switchModeHighlight}>Đăng ký ngay</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* TAB 2: REGISTER */
              <View>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.formTitle}>Đăng ký tài khoản mới</Text>
                  <View style={styles.authBadge}>
                    <Text style={styles.authBadgeText}>Xác thực Email</Text>
                  </View>
                </View>

                {/* Registration Info Notice */}
                <View style={styles.regInfoBox}>
                  <Text style={styles.regInfoIcon}>ℹ️</Text>
                  <Text style={styles.regInfoText}>
                    Hệ thống sẽ gửi email xác thực đến địa chỉ của bạn. Bạn cần mở email và xác nhận liên kết kích hoạt trước khi có thể đăng nhập.
                  </Text>
                </View>

                {/* Input Name */}
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
                  <Text style={styles.inputLabel}>Email thật của bạn (để nhận mã xác nhận) *</Text>
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
                      placeholder="Tối thiểu 6 ký tự"
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

                {/* Input Student ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mã số sinh viên (MSSV) / Mã cán bộ</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🎓</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ví dụ: 22IT001"
                      placeholderTextColor={COLORS.textMuted}
                      value={regStudentId}
                      onChangeText={setRegStudentId}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Input Class */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Lớp sinh hoạt / Phòng ban</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🏫</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ví dụ: CNTT2022A"
                      placeholderTextColor={COLORS.textMuted}
                      value={regClass}
                      onChangeText={setRegClass}
                    />
                  </View>
                </View>

                {/* Submit Register */}
                <TouchableOpacity
                  style={[styles.registerSubmitBtn, (loading || guestLoading) && styles.btnDisabled]}
                  onPress={handleDirectRegister}
                  activeOpacity={0.85}
                  disabled={loading || guestLoading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.registerSubmitText}>
                      ✉️ Đăng ký tài khoản (Gửi email kích hoạt)
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchModeLink}
                  onPress={() => {
                    setErrorNotice(null);
                    setAuthMode('login');
                  }}
                >
                  <Text style={styles.switchModeText}>
                    Đã có tài khoản?{' '}
                    <Text style={styles.switchModeHighlight}>Đăng nhập ngay</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn
            </Text>
            <Text style={styles.footerSubText}>
              Bảo mật danh tính sinh viên & giảng viên qua Supabase Auth và Email Verification
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: SPACING.md,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoImage: {
    width: 68,
    height: 68,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  vkuTag: {
    backgroundColor: 'rgba(217, 83, 79, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.4)',
  },
  vkuTagText: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  supabaseTag: {
    backgroundColor: 'rgba(62, 207, 142, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 142, 0.4)',
  },
  supabaseTagText: {
    color: '#3ecf8e',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },

  // Guest card
  guestSection: {
    marginBottom: SPACING.md,
  },
  guestCard: {
    backgroundColor: '#161f30',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: '#23324d',
  },
  guestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  guestIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTextCol: {
    flex: 1,
  },
  guestTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  guestSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  guestBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  guestBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  guestBtnArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#23324d',
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Notices
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  successBannerTitle: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  successBannerBody: {
    color: '#a7f3d0',
    fontSize: 12,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorBannerTitle: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorBannerBody: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 18,
  },
  bannerIconCol: {
    paddingTop: 2,
  },
  closeBannerBtn: {
    paddingHorizontal: 4,
  },
  closeBannerText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Form card
  formCard: {
    backgroundColor: '#111827',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  tabSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#0a0f1d',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.base,
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#1e293b',
  },
  tabSwitchText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabSwitchTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  authBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  authBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '700',
  },
  regInfoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    padding: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.base,
  },
  regInfoIcon: {
    fontSize: 14,
  },
  regInfoText: {
    flex: 1,
    color: '#93c5fd',
    fontSize: 11,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: SPACING.sm,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  textInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    color: '#ffffff',
    fontSize: 14,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  eyeText: {
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  registerSubmitBtn: {
    backgroundColor: '#059669',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  registerSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  switchModeLink: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  switchModeText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  switchModeHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.base,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubText: {
    color: '#4b5563',
    fontSize: 10,
    textAlign: 'center',
  },
});
