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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { StudentSession } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

const DEMO_ACCOUNTS: Array<StudentSession & { roleDesc: string }> = [
  {
    name: 'Nguyễn Văn A',
    studentId: '22IT001',
    studentClass: 'CNTT2022A',
    email: '22it001@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính',
    roleDesc: 'Sinh viên A (Trưởng nhóm Lab)',
  },
  {
    name: 'Trần Thị B',
    studentId: '22IT002',
    studentClass: 'HTTT2022B',
    email: '22it002@vku.udn.vn',
    faculty: 'Khoa Hệ thống Thông tin',
    roleDesc: 'Sinh viên B (Test Race Condition)',
  },
  {
    name: 'Lê Hoàng C',
    studentId: '22IT003',
    studentClass: 'ANTT2021',
    email: '22it003@vku.udn.vn',
    faculty: 'Khoa An toàn Thông tin',
    roleDesc: 'Sinh viên C (Nghiên cứu sinh)',
  },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useBookingStore();
  const [studentIdInput, setStudentIdInput] = useState('22IT001');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleManualLogin = () => {
    const trimmed = studentIdInput.trim();
    if (!trimmed) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã số sinh viên hoặc Email VKU.');
      return;
    }

    // Check if matches known demo or create session
    const matched = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.studentId.toLowerCase() === trimmed.toLowerCase() ||
        (acc.email && acc.email.toLowerCase() === trimmed.toLowerCase())
    );

    if (matched) {
      login(matched);
    } else {
      login({
        name: `Sinh viên ${trimmed.toUpperCase()}`,
        studentId: trimmed.toUpperCase(),
        studentClass: 'VKU-2022',
        email: `${trimmed.toLowerCase()}@vku.udn.vn`,
        faculty: 'Khoa Khoa học Máy tính',
      });
    }
  };

  const handleQuickLogin = (account: StudentSession) => {
    login(account);
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
            </View>
            <Text style={styles.appTitle}>VKU Study Room</Text>
            <Text style={styles.appSubtitle}>
              Hệ thống đặt phòng học & phòng Lab thông minh
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Đăng nhập tài khoản</Text>

            {/* Input Student ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã sinh viên / Email VKU</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🎓</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: 22IT001 hoặc email @vku.udn.vn"
                  placeholderTextColor={COLORS.textMuted}
                  value={studentIdInput}
                  onChangeText={setStudentIdInput}
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
                  placeholder="Nhập mật khẩu sinh viên"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleManualLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Switcher Section */}
          <View style={styles.demoSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>TÀI KHOẢN MẪU ĐỂ CHẤM ĐIỂM / DEMO</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.demoHint}>
              Bấm 1 chạm để đăng nhập tức thì và thử nghiệm xung đột đặt phòng:
            </Text>

            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.studentId}
                style={styles.demoItem}
                onPress={() => handleQuickLogin(acc)}
                activeOpacity={0.8}
              >
                <View style={styles.demoAvatar}>
                  <Text style={styles.demoAvatarText}>
                    {acc.name.split(' ').pop()?.[0] || 'SV'}
                  </Text>
                </View>
                <View style={styles.demoInfo}>
                  <View style={styles.demoNameRow}>
                    <Text style={styles.demoName}>{acc.name}</Text>
                    <View style={styles.demoIdBadge}>
                      <Text style={styles.demoIdText}>{acc.studentId}</Text>
                    </View>
                  </View>
                  <Text style={styles.demoDesc}>{acc.roleDesc}</Text>
                  <Text style={styles.demoSubText}>
                    {acc.studentClass} • {acc.faculty}
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
              Học phần: Lập trình ứng dụng đa nền tảng
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
    paddingTop: SPACING.base,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    marginBottom: SPACING.xs,
  },
  vkuTag: {
    backgroundColor: 'rgba(0, 51, 102, 0.4)',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  vkuTagText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  eyeText: {
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginBottom: SPACING.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
    letterSpacing: 0.5,
  },
  demoHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.sm,
  },
  demoAvatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  demoAvatarText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  demoIdBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  demoIdText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  demoDesc: {
    fontSize: 11,
    color: COLORS.accentLight,
    marginTop: 2,
    fontWeight: '600',
  },
  demoSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  demoArrow: {
    color: COLORS.textMuted,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
