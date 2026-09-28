import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimeSlot } from '../types/booking';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  bookedSlotIds: string[];
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function TimeSlotGrid({
  slots,
  selectedSlotId,
  bookedSlotIds,
  onSelectSlot,
}: TimeSlotGridProps) {
  return (
    <View style={styles.container}>
      {slots.map((slot) => {
        const isBooked = bookedSlotIds.includes(slot.id);
        const isSelected = selectedSlotId === slot.id;

        return (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.slot,
              isBooked && styles.slotBooked,
              isSelected && styles.slotSelected,
            ]}
            onPress={() => !isBooked && onSelectSlot(slot)}
            disabled={isBooked}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.slotText,
                isBooked && styles.slotTextBooked,
                isSelected && styles.slotTextSelected,
              ]}
            >
              {slot.label}
            </Text>
            {isBooked && (
              <Text style={styles.slotSubText}>Đã đặt</Text>
            )}
            {!isBooked && isSelected && (
              <Text style={styles.slotSubText}>✓ Đã chọn</Text>
            )}
            {!isBooked && !isSelected && (
              <Text style={[styles.slotSubText, { color: COLORS.available }]}>Còn trống</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  slot: {
    width: '47%',
    backgroundColor: COLORS.slotDefault,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  slotBooked: {
    backgroundColor: COLORS.slotBooked,
    borderColor: COLORS.slotBooked,
    opacity: 0.5,
  },
  slotSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  slotText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  slotTextBooked: {
    color: COLORS.slotBookedText,
  },
  slotTextSelected: {
    color: '#fff',
  },
  slotSubText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
