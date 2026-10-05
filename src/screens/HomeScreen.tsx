import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchRooms } from '../services/bookingApi';
import { MOCK_ROOMS } from '../data/mockRooms';
import { Room, Building, Equipment } from '../types/booking';
import { useBookingStore } from '../store/useBookingStore';
import RoomCard from '../components/RoomCard';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { signOutSupabase } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

const BUILDINGS: Array<{ label: string; value: Building | 'ALL' }> = [
  { label: 'Tất cả tòa', value: 'ALL' },
  { label: 'Tòa A', value: 'A' },
  { label: 'Tòa B', value: 'B' },
  { label: 'Tòa C', value: 'C' },
  { label: 'Tòa V', value: 'V' },
];

const CAPACITIES = [
  { label: 'Mọi quy mô', min: 0, max: 100 },
  { label: '2–10 người', min: 2, max: 10 },
  { label: '11–20 người', min: 11, max: 20 },
  { label: '21+ người', min: 21, max: 100 },
];

const EQUIPMENTS: Array<{ label: string; value: Equipment }> = [
  { label: '📽 Máy chiếu', value: 'projector' },
  { label: '💻 PC cao cấp', value: 'high_spec_pc' },
  { label: '📋 Bảng trắng', value: 'whiteboard' },
  { label: '❄️ Điều hoà', value: 'ac' },
];

export default function HomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState<Building | 'ALL'>('ALL');
  const [capacityIdx, setCapacityIdx] = useState(0);
  const [selectedEquip, setSelectedEquip] = useState<Equipment[]>([]);
  const { user, logout } = useBookingStore();

  const handleLogout = async () => {
    try {
      await signOutSupabase();
    } catch {
      // ignore
    } finally {
      logout();
    }
  };

  // TanStack Query: Fetch server state from Supabase
  const { data: rooms = MOCK_ROOMS, isLoading, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 30,
  });

  const toggleEquip = useCallback((eq: Equipment) => {
    setSelectedEquip((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  }, []);

  const filteredRooms = useMemo(() => {
    const selectedCap = CAPACITIES[capacityIdx];
    return rooms.filter((room) => {
      const matchSearch =
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.description.toLowerCase().includes(search.toLowerCase());
      const matchBuilding = building === 'ALL' || room.building === building;
      const matchCapacity =
        room.capacity >= selectedCap.min && room.capacity <= selectedCap.max;
      const matchEquip =
        selectedEquip.length === 0 ||
        selectedEquip.every((eq) => room.equipment.includes(eq));
      return matchSearch && matchBuilding && matchCapacity && matchEquip;
    });
  }, [rooms, search, building, capacityIdx, selectedEquip]);

  const renderRoom = useCallback(
    ({ item }: { item: Room }) => (
      <RoomCard
        room={item}
        onPress={() => navigation.navigate('RoomDetail', { room: item })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderRoom}
        windowSize={7}
        removeClippedSubviews
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                <View style={styles.studentBadge}>
                  <Text style={styles.studentBadgeText}>
                    {user.role === 'teacher' ? '👨‍🏫' : '🎓'} {user.name} ({user.studentId})
                  </Text>
                </View>
                <Text style={styles.title}>Đặt phòng học VKU</Text>
              </View>
              <View style={styles.headerRightCol}>
                <View style={styles.vkuBadge}>
                  <Text style={styles.vkuText}>VKU</Text>
                </View>
                <TouchableOpacity
                  style={styles.headerLogoutBtn}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerLogoutText}>🚪 Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Stats Bar */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{rooms.length}</Text>
                <Text style={styles.statLabel}>Phòng học</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: COLORS.available }]}>
                  {rooms.filter(r => r.status === 'available').length}
                </Text>
                <Text style={styles.statLabel}>Còn trống</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNum}>4</Text>
                <Text style={styles.statLabel}>Tòa nhà</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: COLORS.accent }]}>Realtime</Text>
                <Text style={styles.statLabel}>Supabase</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm phòng học, lab AI, phòng seminar..."
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Building Filter Chips */}
            <View style={styles.filterScrollRow}>
              {BUILDINGS.map((b) => (
                <TouchableOpacity
                  key={b.value}
                  style={[styles.chip, building === b.value && styles.chipActive]}
                  onPress={() => setBuilding(b.value)}
                >
                  <Text style={[styles.chipText, building === b.value && styles.chipTextActive]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Capacity Filter Chips */}
            <View style={styles.filterScrollRow}>
              {CAPACITIES.map((c, idx) => (
                <TouchableOpacity
                  key={c.label}
                  style={[styles.chip, capacityIdx === idx && styles.chipCapActive]}
                  onPress={() => setCapacityIdx(idx)}
                >
                  <Text style={[styles.chipText, capacityIdx === idx && styles.chipTextActive]}>
                    👥 {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Equipment Filter */}
            <View style={styles.filterScrollRow}>
              {EQUIPMENTS.map((eq) => {
                const active = selectedEquip.includes(eq.value);
                return (
                  <TouchableOpacity
                    key={eq.value}
                    style={[styles.chip, active && styles.chipEquipActive]}
                    onPress={() => toggleEquip(eq.value)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {eq.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Count */}
            <Text style={styles.resultCount}>
              {filteredRooms.length} phòng được tìm thấy
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Không tìm thấy phòng phù hợp</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingBottom: SPACING.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
    paddingTop: SPACING.sm,
  },
  greeting: { color: COLORS.textSecondary, fontSize: 14 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  vkuBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  vkuText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  searchRow: { paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterScrollRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  chipCapActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  chipEquipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accentLight },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  studentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 4,
  },
  studentBadgeText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNum: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.cardBorder },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.base, lineHeight: 18 },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  studentCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  studentAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  studentNameActive: { color: COLORS.accent },
  studentMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  closeModalBtn: {
    backgroundColor: COLORS.cardBorder,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  closeModalText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  modalLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalLogoutText: { color: '#f87171', fontWeight: '700', fontSize: 14 },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  headerLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  headerLogoutText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 16 },
});
