import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { sendTestNotification } from '../services/notificationService';
import { STANDARD_ACCOUNTS, signOutSupabase } from '../services/authService';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, logout, getMyBookings } = useBookingStore();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const myBookings = getMyBookings();
  const upcomingCount = myBookings.filter((b) => b.status === 'upcoming').length;
  const completedCount = myBookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = myBookings.filter((b) => b.status === 'cancelled').length;

  const isTeacher = user.role === 'teacher';
  const isGoogle = user.authProvider === 'google' || user.email?.endsWith('@gmail.com');

  const handleTestAlert = async () => {
    try {
      await sendTestNotification('Phòng tự học VKU', 'Nhắc nhở ca học bắt đầu sau 15 phút');
      Alert.alert('✅ Thành công', 'Hệ thống thông báo đẩy cục bộ đang hoạt động tốt!');
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể kích hoạt thông báo.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      `Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${user.name} không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await signOutSupabase();
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isTeacher ? 'Hồ sơ Giảng viên' : 'Hồ sơ sinh viên'}
          </Text>
          <View style={styles.badgeRow}>
            {isGoogle && (
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeText}>G GMAIL</Text>
              </View>
            )}
            <View style={styles.vkuBadge}>
              <Text style={styles.vkuBadgeText}>VKU ID</Text>
            </View>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, isTeacher && styles.profileCardTeacher]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, isTeacher && styles.avatarTeacher]}>
              <Text style={styles.avatarText}>
                {user.avatar || (isTeacher ? '👨‍🏫' : user.name.split(' ').pop()?.[0] || 'SV')}
              </Text>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.studentName}>{user.name}</Text>
              <View style={styles.tagRow}>
                {isTeacher ? (
                  <View style={styles.teacherRoleTag}>
                    <Text style={styles.teacherRoleTagText}>GIẢNG VIÊN VKU</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.idBadge}>
                      <Text style={styles.idText}>{user.studentId}</Text>
                    </View>
                    <View style={styles.classBadge}>
                      <Text style={styles.classText}>{user.studentClass}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details list */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Khoa / Bộ môn:</Text>
            <Text style={styles.detailVal}>
              {user.faculty || 'Khoa Khoa học Máy tính'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email đăng nhập:</Text>
            <Text style={styles.detailVal}>
              {user.email || `${user.studentId.toLowerCase()}@vku.udn.vn`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hình thức xác thực:</Text>
            <View style={styles.authMethodBadge}>
              <Text style={styles.authMethodText}>
                {isGoogle ? 'Google / Gmail OAuth' : 'Supabase Auth Backend'}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái kết nối:</Text>
            <View style={styles.statusBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Realtime Supabase</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Thống kê lịch đặt phòng</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.accent }]}>
              {myBookings.length}
            </Text>
            <Text style={styles.statLabel}>Tổng lượt đặt</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.available }]}>
              {upcomingCount}
            </Text>
            <Text style={styles.statLabel}>Sắp tới</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.occupied }]}>
              {cancelledCount}
            </Text>
            <Text style={styles.statLabel}>Đã huỷ</Text>
          </View>
        </View>

        {/* System & Notification Settings */}
        <Text style={styles.sectionTitle}>Cài đặt & Dịch vụ</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleTestAlert}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Kiểm tra thông báo nhắc nhở</Text>
              <Text style={styles.settingSubtitle}>
                Báo thức 15 phút trước ca học qua Expo Notifications
              </Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.innerDivider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowSwitchModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <Text style={{ fontSize: 18 }}>🔄</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Đổi tài khoản nhanh (Giảng viên / SV)</Text>
              <Text style={styles.settingSubtitle}>
                Chuyển qua Thầy Tuấn, SV A, B, C để thử nghiệm Race Condition
              </Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>🚪 Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <Text style={styles.versionNote}>
          VKU Study Room v1.0.0 • React Native Expo 57 • Supabase Backend
        </Text>
      </ScrollView>

      {/* Switch Student Modal */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn tài khoản thử nghiệm</Text>
            <Text style={styles.modalSub}>
              Chuyển nhanh giữa tài khoản Giảng viên và Sinh viên:
            </Text>

            {STANDARD_ACCOUNTS.map((item) => (
              <TouchableOpacity
                key={item.email}
                style={[
                  styles.modalItem,
                  user.email === item.email && styles.modalItemActive,
                  item.role === 'teacher' && styles.modalItemTeacher,
                ]}
                onPress={() => {
                  setUser(item);
                  setShowSwitchModal(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>{item.avatar || '👤'}</Text>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.modalName}>{item.name}</Text>
                      {item.role === 'teacher' && (
                        <View style={styles.modalTeacherTag}>
                          <Text style={styles.modalTeacherTagText}>GIẢNG VIÊN</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.modalClass}>
                      {item.email} • {item.faculty}
                    </Text>
                  </View>
                </View>
                {user.email === item.email && (
                  <Text style={styles.modalCheck}>✓ Đang chọn</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSwitchModal(false)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
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
  content: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  googleBadge: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderColor: '#4285F4',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  googleBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
  },
  vkuBadge: {
    backgroundColor: 'rgba(0, 51, 102, 0.4)',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  vkuBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
  },
  profileCardTeacher: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  avatarTeacher: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  avatarText: {
    fontSize: 24,
  },
  profileTextCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  teacherRoleTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  teacherRoleTagText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  idBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  idText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  classBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  classText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  authMethodBadge: {
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  authMethodText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.available,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.available,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingArrow: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  innerDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: SPACING.base,
  },
  logoutBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    borderColor: COLORS.occupied,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoutText: {
    color: COLORS.occupied,
    fontSize: 14,
    fontWeight: '700',
  },
  versionNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.base,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalItemTeacher: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  modalItemActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  modalTeacherTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  modalTeacherTagText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
  },
  modalName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalClass: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalCheck: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  modalCloseText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
