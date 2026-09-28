import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Share, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { sendTestNotification } from '../services/notificationService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingPass'>;
  route: RouteProp<RootStackParamList, 'BookingPass'>;
};

export default function BookingPassScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { booking } = route.params;

  const qrData = JSON.stringify({
    id: booking.id,
    room: booking.roomName,
    student: booking.studentId,
    date: booking.date,
    slot: booking.slot.label,
  });

  const handleTestNotification = async () => {
    try {
      await sendTestNotification(booking.roomName, booking.slot.label);
      Alert.alert('✅ Thành công', 'Thông báo nhắc nhở sẽ xuất hiện sau 3 giây!');
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể gửi thông báo. Kiểm tra quyền thông báo.');
    }
  };

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.title}>Đặt phòng thành công!</Text>
          <Text style={styles.subtitle}>Xuất trình mã QR khi check-in</Text>
        </View>

        {/* Ticket */}
        <View style={styles.ticket}>
          {/* Top band */}
          <View style={styles.ticketTop}>
            <View>
              <Text style={styles.ticketLabel}>VKU Study Room</Text>
              <Text style={styles.ticketRoom}>{booking.roomName}</Text>
              <Text style={styles.ticketBuilding}>Tòa {booking.building} · Tầng {booking.floor}</Text>
            </View>
            <View style={styles.vkuBadge}>
              <Text style={styles.vkuText}>VKU</Text>
            </View>
          </View>

          {/* Dashed divider */}
          <View style={styles.divider}>
            <View style={styles.dividerCircleLeft} />
            <View style={styles.dividerLine} />
            <View style={styles.dividerCircleRight} />
          </View>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày đặt</Text>
              <Text style={styles.infoValue}>{formatDate(booking.date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Khung giờ</Text>
              <Text style={styles.infoValue}>{booking.slot.label}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sinh viên</Text>
              <Text style={styles.infoValue}>{booking.studentName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>MSSV</Text>
              <Text style={styles.infoValue}>{booking.studentId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Lớp</Text>
              <Text style={styles.infoValue}>{booking.studentClass}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text style={[styles.infoValue, { color: COLORS.available }]}>✓ Đã xác nhận</Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={160}
              color="#000"
              backgroundColor="#fff"
            />
            <Text style={styles.qrHint}>Quét mã để check-in</Text>
            <Text style={styles.bookingId}>#{booking.id.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Notification info */}
        <View style={styles.notifInfo}>
          <Text style={styles.notifText}>
            🔔 Bạn sẽ nhận được nhắc nhở trước giờ bắt đầu 15 phút.
          </Text>
        </View>

        {/* Test Notification Button */}
        <TouchableOpacity style={styles.testBtn} onPress={handleTestNotification} activeOpacity={0.8}>
          <Text style={styles.testBtnText}>🔔 Gửi thông báo thử nghiệm (3 giây)</Text>
        </TouchableOpacity>

        {/* Done button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.base, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.sm },
  successIcon: { fontSize: 56 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },

  ticket: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  ticketTop: {
    backgroundColor: COLORS.primary,
    padding: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  ticketRoom: { color: '#fff', fontSize: 20, fontWeight: '800' },
  ticketBuilding: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  vkuBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  vkuText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
  },
  dividerCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    marginLeft: -10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dividerCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    marginRight: -10,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  infoItem: { width: '47%' },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  infoValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },

  qrContainer: {
    alignItems: 'center',
    padding: SPACING.base,
    paddingBottom: SPACING.xl,
    backgroundColor: '#fff',
    margin: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  qrHint: { color: '#666', fontSize: 12, marginTop: SPACING.sm },
  bookingId: { color: '#999', fontSize: 11, marginTop: 4, letterSpacing: 1 },

  notifInfo: {
    backgroundColor: `${COLORS.primary}33`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.base,
    borderWidth: 1,
    borderColor: `${COLORS.primaryLight}55`,
  },
  notifText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },

  testBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  testBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },

  doneBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
