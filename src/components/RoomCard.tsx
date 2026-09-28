import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Room } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';
import { getRoomImage } from '../data/roomImages';

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

const equipmentLabel: Record<string, string> = {
  projector: '📽 Máy chiếu',
  whiteboard: '📋 Bảng trắng',
  high_spec_pc: '💻 PC cao cấp',
  ac: '❄️ Điều hoà',
};

const RoomCard = memo(({ room, onPress }: RoomCardProps) => {
  const isAvailable = room.status === 'available';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Real Room Image Header */}
      <ImageBackground source={getRoomImage(room.id)} style={styles.imageHeader} imageStyle={styles.imageRadius}>
        <View style={styles.imageOverlay} />
        <View style={styles.badgeRow}>
          <View style={styles.buildingBadge}>
            <Text style={styles.buildingText}>Tòa {room.building}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isAvailable ? COLORS.available : COLORS.occupied }]}>
            <Text style={styles.statusText}>{isAvailable ? '● Còn trống' : '● Đang dùng'}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.floor}>Tầng {room.floor} • Sức chứa {room.capacity} người</Text>
        <Text style={styles.description} numberOfLines={2}>{room.description}</Text>

        {/* Equipment tags */}
        <View style={styles.equipRow}>
          {room.equipment.slice(0, 3).map((eq) => (
            <View key={eq} style={styles.equipTag}>
              <Text style={styles.equipText}>{equipmentLabel[eq]}</Text>
            </View>
          ))}
          {room.equipment.length > 3 && (
            <View style={styles.equipTag}>
              <Text style={styles.equipText}>+{room.equipment.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default RoomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  imageHeader: {
    height: 140,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  imageRadius: {
    borderTopLeftRadius: RADIUS.lg - 1,
    borderTopRightRadius: RADIUS.lg - 1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderTopLeftRadius: RADIUS.lg - 1,
    borderTopRightRadius: RADIUS.lg - 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  buildingText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  body: {
    padding: SPACING.base,
  },
  roomName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  floor: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  equipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipTag: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  equipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
