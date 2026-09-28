import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {dates.map((date) => {
        const iso = date.toISOString().split('T')[0];
        const isSelected = iso === selectedDate;
        const isToday = iso === new Date().toISOString().split('T')[0];
        return (
          <TouchableOpacity
            key={iso}
            style={[styles.dateItem, isSelected && styles.dateItemSelected]}
            onPress={() => onSelectDate(iso)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayLabel, isSelected && styles.textSelected]}>
              {isToday ? 'HN' : DAYS_VI[date.getDay()]}
            </Text>
            <Text style={[styles.dateNum, isSelected && styles.textSelected]}>
              {date.getDate()}
            </Text>
            {isToday && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  dateItem: {
    width: 52,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 2,
  },
  dateItemSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dateNum: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  textSelected: {
    color: '#fff',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  dotSelected: {
    backgroundColor: '#fff',
  },
});
