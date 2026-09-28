import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, StatusBar, Modal, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { useBookingStore } from '../store/useBookingStore';
import { BookingRecord } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { cancelNotification } from '../services/notificationService';
import { fetchMyBookingsApi, cancelBookingApi } from '../services/bookingApi';

type TabType = 'upcoming' | 'history';

export default function MyBookingsScreen() {
  const { getMyBookings, cancelBooking, user } = useBookingStore();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const queryClient = useQueryClient();

  // TanStack Query: Fetch server bookings for current student
  const { data: serverBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['myBookings', user.studentId],
    queryFn: () => fetchMyBookingsApi(user.studentId),
    staleTime: 1000 * 15,
  });

  // Merge server and local store (avoiding duplicates)
  const localBookings = getMyBookings();
  const allMyBookings = React.useMemo(() => {
    if (serverBookings.length > 0) return serverBookings;
    return localBookings;
  }, [serverBookings, localBookings]);

  const filtered = allMyBookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'upcoming';
    return b.status === 'completed' || b.status === 'cancelled';
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBookingApi,
    onSuccess: (_, bookingId) => {
      cancelBooking(bookingId);
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookedSlots'] });
      Alert.alert('Thành công', 'Đã huỷ đặt phòng thành công.');
    },
    onError: () => {
      Alert.alert('Lỗi', 'Không thể huỷ đặt phòng lúc này.');
    },
  });

  const handleCancel = (booking: BookingRecord) => {
    Alert.alert(
      'Huỷ đặt phòng',
      `Bạn có chắc muốn huỷ phòng ${booking.roomName} lúc ${booking.slot.label} không?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Huỷ đặt phòng',
          style: 'destructive',
          onPress: async () => {
            if (booking.notificationId) {
              await cancelNotification(booking.notificationId);
            }
            cancelMutation.mutate(booking.id);
          },
        },
      ]
    );
  };

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const renderItem = ({ item }: { item: BookingRecord }) => {
    const statusColor =
      item.status === 'upcoming' ? COLORS.available :
      item.status === 'cancelled' ? COLORS.error : COLORS.textMuted;
    const statusLabel =
      item.status === 'upcoming' ? '● Sắp tới' :
      item.status === 'cancelled' ? '✕ Đã huỷ' : '✓ Hoàn tất';

    const qrData = JSON.stringify({
      id: item.id,
      room: item.roomName,
      student: item.studentId,
      date: item.date,
      slot: item.slot.label,
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.roomName}>{item.roomName}</Text>
            <Text style={styles.buildingText}>Tòa {item.building} · Tầng {item.floor}</Text>
          </View>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.infoText}>📅 {formatDate(item.date)}</Text>
          <Text style={styles.infoText}>🕐 {item.slot.label}</Text>
          <Text style={styles.infoText}>🎓 {item.studentId}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => setSelectedBooking(item)}
          >
            <Text style={styles.qrBtnText}>📱 Xem QR</Text>
          </TouchableOpacity>
          {item.status === 'upcoming' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
            >
              <Text style={styles.cancelBtnText}>Huỷ đặt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.title}>Lịch đặt của tôi</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Sắp tới ({allMyBookings.filter((b) => b.status === 'upcoming').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Chưa có lịch đặt phòng nào</Text>
          </View>
        }
      />

      {/* QR Modal */}
      <Modal visible={!!selectedBooking} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedBooking?.roomName}</Text>
            <Text style={styles.modalSub}>
              {selectedBooking ? `${formatDate(selectedBooking.date)} · ${selectedBooking.slot.label}` : ''}
            </Text>
            {selectedBooking && (
              <View style={styles.qrBox}>
                <QRCode
                  value={JSON.stringify({
                    id: selectedBooking.id,
                    room: selectedBooking.roomName,
                    student: selectedBooking.studentId,
                    date: selectedBooking.date,
                    slot: selectedBooking.slot.label,
                  })}
                  size={180}
                  color="#000"
                  backgroundColor="#fff"
                />
                <Text style={styles.qrId}>#{selectedBooking.id.slice(-8).toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBooking(null)}>
              <Text style={styles.closeBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: SPACING.base, paddingTop: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.sm,
  },
  tab: { flex: 1, padding: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.sm },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: SPACING.base, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  roomName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  buildingText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardInfo: { gap: 4, marginBottom: SPACING.sm },
  infoText: { color: COLORS.textSecondary, fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  qrBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  qrBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, marginBottom: SPACING.lg },
  qrBox: { backgroundColor: '#fff', padding: SPACING.base, borderRadius: RADIUS.lg, alignItems: 'center' },
  qrId: { color: '#999', fontSize: 11, marginTop: SPACING.sm, letterSpacing: 1 },
  closeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  closeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
