import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { WeeklyDataPoint } from '../types';

interface Props {
  data: WeeklyDataPoint[];
  compact?: boolean;
}

export default function WeeklyReportCard({ data, compact }: Props) {
  const maxScreenTime = Math.max(...data.map((d) => d.screenTime), 1);
  const totalScreenTime = data.reduce((s, d) => s + d.screenTime, 0);
  const totalFocusTime = data.reduce((s, d) => s + d.focusTime, 0);
  const totalPoints = data.reduce((s, d) => s + d.points, 0);

  return (
    <View style={[styles.card, Shadow.soft]}>
      <Text style={styles.title}>Weekly Trends</Text>
      {!compact && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{Math.round(totalScreenTime / 60)}h</Text>
            <Text style={styles.summaryLabel}>Screen Time</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{Math.round(totalFocusTime / 60)}h</Text>
            <Text style={styles.summaryLabel}>Focus Time</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{totalPoints}</Text>
            <Text style={styles.summaryLabel}>Points</Text>
          </View>
        </View>
      )}
      <View style={styles.chartContainer}>
        {data.map((point, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barsWrapper}>
              <View
                style={[
                  styles.barFocus,
                  { height: `${Math.max((point.focusTime / maxScreenTime) * 80, 4)}%` },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  { height: `${Math.max((point.screenTime / maxScreenTime) * 100, 4)}%` },
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{point.day}</Text>
          </View>
        ))}
      </View>
      {!compact && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Screen</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primaryContainer }]} />
            <Text style={styles.legendText}>Focus</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    fontFamily: 'Literata_700Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: Spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: '100%',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
    backgroundColor: Colors.primary,
  },
  barFocus: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
    opacity: 0.6,
    backgroundColor: Colors.primaryContainer,
  },
  dayLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    fontFamily: 'NunitoSans_400Regular',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '50',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
});
