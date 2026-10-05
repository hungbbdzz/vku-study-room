import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator, ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import DateSelector from '../components/DateSelector';
import TimeSlotGrid from '../components/TimeSlotGrid';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../data/mockRooms';
import { BookingRecord } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { scheduleCheckInReminder } from '../services/notificationService';
import { fetchBookedSlots, createBookingApi } from '../services/bookingApi';
import { getRoomImage } from '../data/roomImages';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;
  route: RouteProp<RootStackParamList, 'RoomDetail'>;
};

const equipmentLabel: Record<string, string> = {
  projector: '📽 Máy chiếu',
  whiteboard: '📋 Bảng trắng',
  high_spec_pc: '💻 PC cấu hình cao',
  ac: '❄️ Điều hoà',
};

export default function RoomDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { room } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { isSlotBooked, createBooking, user } = useBookingStore();
  const queryClient = useQueryClient();

  // TanStack Query: Server state for booked slots with 3s polling for real-time conflict detection
  const { data: serverBookedSlots = [], refetch: refetchBookedSlots } = useQuery({
    queryKey: ['bookedSlots', room.id, selectedDate],
    queryFn: () => fetchBookedSlots(room.id, selectedDate),
    refetchInterval: 3000,
  });

  // Combine local state and server state
  const bookedSlotIds = useMemo(() => {
    const localBooked = TIME_SLOTS.filter((s) => isSlotBooked(room.id, selectedDate, s.id)).map((s) => s.id);
    return Array.from(new Set([...serverBookedSlots, ...localBooked]));
  }, [room.id, selectedDate, isSlotBooked, serverBookedSlots]);

  const selectedSlot = TIME_SLOTS.find((s) => s.id === selectedSlotId) || null;

  // TanStack Mutation with Database-level Race Condition Handling
  const bookingMutation = useMutation({
    mutationFn: createBookingApi,
    onSuccess: (result, variables) => {
      if (result.success && result.data) {
        createBooking(result.data);
        queryClient.invalidateQueries({ queryKey: ['bookedSlots'] });
        queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        navigation.navigate('BookingPass', { booking: result.data });
      } else if (result.isConflict) {
        // RACE CONDITION PREVENTED!
        refetchBookedSlots();
        Alert.alert(
          '⚡ Xung đột lịch đặt!',
          'Khung giờ này vừa có sinh viên khác nhanh tay đặt trước! Vui lòng chọn một khung giờ khác.',
          [{ text: 'Đã hiểu', onPress: () => setSelectedSlotId(null) }]
        );
      } else {
        Alert.alert('Không thể đặt phòng', result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    },
    onError: (err: any) => {
      Alert.alert('Lỗi kết nối', err?.message || 'Không thể kết nối đến máy chủ.');
    },
  });

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn giờ', 'Vui lòng chọn một khung giờ trước khi đặt phòng.');
      return;
    }

    if (bookedSlotIds.includes(selectedSlot.id)) {
      Alert.alert('Khung giờ đã kín', 'Khung giờ này đã được đặt, vui lòng chọn giờ khác.');
      return;
    }

    const bookingId = `booking-${Date.now()}`;

    // Trigger atomic server mutation with conflict prevention
    bookingMutation.mutate({
      id: bookingId,
      roomId: room.id,
      roomName: room.name,
      building: room.building,
      floor: room.floor,
      date: selectedDate,
      slot: selectedSlot,
      studentName: user.name,
      studentId: user.studentId,
      studentClass: user.studentClass,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={room.color} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        {/* Photo Hero with Gradient Overlay */}
        <ImageBackground source={getRoomImage(room.id)} style={styles.hero} imageStyle={styles.heroImageRadius}>
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            <View style={styles.buildingBadge}>
              <Text style={styles.buildingText}>TÒA {room.building} • TẦNG {room.floor}</Text>
            </View>
            <Text style={styles.heroName}>{room.name}</Text>
            <Text style={styles.heroSub}>Sức chứa tiêu chuẩn: {room.capacity} sinh viên</Text>
          </View>
        </ImageBackground>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.desc}>{room.description}</Text>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trang thiết bị</Text>
          <View style={styles.equipRow}>
            {room.equipment.map((eq) => (
              <View key={eq} style={styles.equipItem}>
                <Text style={styles.equipLabel}>{equipmentLabel[eq]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <DateSelector selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setSelectedSlotId(null); }} />
        </View>

        {/* Time Slot Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
          <TimeSlotGrid
            slots={TIME_SLOTS}
            selectedSlotId={selectedSlotId}
            bookedSlotIds={bookedSlotIds}
            onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.available }]} />
            <Text style={styles.legendText}>Còn trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.slotBooked, opacity: 0.5 }]} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookBtn, (!selectedSlot || bookingMutation.isPending) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={!selectedSlot || bookingMutation.isPending}
          activeOpacity={0.8}
        >
          {bookingMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookBtnText}>
              {selectedSlot ? `Đặt phòng ${selectedSlot.label}` : 'Chọn khung giờ để đặt'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 32 },
  hero: {
    padding: SPACING.base,
    height: 230,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroImageRadius: {
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 12, 26, 0.65)',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  heroInfo: { marginTop: SPACING.lg },
  buildingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  buildingText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  section: { marginTop: SPACING.base },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: SPACING.base,
  },
  equipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  equipItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  equipLabel: { color: COLORS.textSecondary, fontSize: 13 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.base,
    marginTop: SPACING.base,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.textMuted, fontSize: 12 },
  bookBtn: {
    backgroundColor: COLORS.accent,
    margin: SPACING.base,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: 'center',
  },
  bookBtnDisabled: { backgroundColor: COLORS.cardBorder },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
