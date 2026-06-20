import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../../src/store/AppContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { formatTime, generateWeeklyData, getDayLabels } from '../../src/utils/helpers';
import { AppCategoryColors } from '../../src/constants/theme';

type Period = 'week' | 'month';

export default function StatsScreen() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const weeklyData = useMemo(
    () => generateWeeklyData(state.focusHistory),
    [state.focusHistory.length]
  );

  const chartConfig = {
    backgroundColor: Colors.surfaceContainerLowest,
    backgroundGradientFrom: Colors.surfaceContainerLowest,
    backgroundGradientTo: Colors.surfaceContainerLowest,
    decimalCount: 0,
    color: () => Colors.primary,
    labelColor: () => Colors.onSurfaceVariant,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      stroke: Colors.outlineVariant + '50',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 10,
      fontFamily: 'NunitoSans',
    },
  };

  const screenWidth = Dimensions.get('window').width - 64;

  const totalFocusTime = state.focusHistory
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  const completedSessions = state.focusHistory.filter((s) => s.completed).length;
  const interruptedSessions = state.focusHistory.filter((s) => s.interrupted).length;

  const categoryTotals = state.dailyLog.appUsage.reduce(
    (acc, app) => {
      acc[app.category] = (acc[app.category] || 0) + app.timeSpent;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryData = Object.entries(categoryTotals).map(([cat, time]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    time,
    color: AppCategoryColors[cat] || Colors.textMuted,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Insights & History</Text>
            <Text style={styles.subtitle}>Understand your habits and cultivate mindful screen time.</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{'\uD83D\uDD25'} {state.user.totalPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.primaryContainer }]}>
            <View style={styles.summaryDeco}>
              <Text style={styles.summaryDecoIcon}>{'\uD83E\uDDE0'}</Text>
            </View>
            <View style={styles.summaryLabelRow}>
              <Text style={styles.summaryIcon}>{'\u23F0'}</Text>
              <Text style={[styles.summaryCardLabel, { color: Colors.onPrimaryContainer }]}>Focus Time</Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: Colors.onPrimaryContainer }]}>
              {Math.floor(totalFocusTime / 60)}<Text style={styles.summaryUnit}>h</Text> {totalFocusTime % 60}<Text style={styles.summaryUnit}>m</Text>
            </Text>
            <Text style={[styles.summaryCardSub, { color: Colors.onPrimaryContainer + 'CC' }]}>+4.2% from last week</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.surfaceContainerHigh }]}>
            <View style={styles.summaryLabelRow}>
              <Text style={styles.summaryIcon}>{'\uD83D\uDD15'}</Text>
              <Text style={styles.summaryCardLabel}>Distractions</Text>
            </View>
            <Text style={styles.summaryCardValue}>
              {Math.floor(totalFocusTime / 3)}<Text style={[styles.summaryUnit, { color: Colors.onSurfaceVariant }]}>h</Text> {Math.round(totalFocusTime / 5)}<Text style={[styles.summaryUnit, { color: Colors.onSurfaceVariant }]}>m</Text>
            </Text>
            <Text style={[styles.summaryCardSub, { color: Colors.onSurfaceVariant }]}>-1.5% from last week</Text>
          </View>
        </View>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {(['week', 'month'] as Period[]).map((p) => (
            <View
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            >
              <Text
                style={[styles.periodText, period === p && styles.periodTextActive]}
                onPress={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Trends Chart */}
        <View style={[styles.chartCard, Shadow.soft]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Trends</Text>
          </View>
          <LineChart
            data={{
              labels: weeklyData.map((d) => d.day),
              datasets: [
                {
                  data: weeklyData.map((d) => Math.max(d.focusTime, 1)),
                  color: () => Colors.primary,
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines
          />
        </View>

        {/* App Categories */}
        <View style={[styles.chartCard, Shadow.soft]}>
          <Text style={styles.chartTitle}>Most Used Apps</Text>
          <View style={styles.categoryList}>
            {categoryData.map((cat) => {
              const total = categoryData.reduce((s, c) => s + c.time, 1);
              const pct = (cat.time / total) * 100;
              return (
                <View key={cat.name} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryLabel}>{cat.name === 'Social' ? 'Communication' : 'Leisure'}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryTime}>{formatTime(cat.time)}</Text>
                      <View style={styles.categoryBarMini}>
                        <View style={[styles.categoryBarMiniFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {state.focusHistory.slice(-5).reverse().map((session) => (
          <View key={session.id} style={[styles.sessionItem, Shadow.soft]}>
            <View style={[styles.sessionIconWrap, { backgroundColor: session.completed ? Colors.primaryFixed : Colors.errorContainer }]}>
              <Text style={styles.sessionIcon}>{session.completed ? '\u2714\uFE0F' : '\u274C'}</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDate}>{session.date}</Text>
              <Text style={styles.sessionDuration}>
                {session.duration} min{session.interrupted ? ' \u2022 interrupted' : ''}
              </Text>
            </View>
            <View style={styles.sessionPointsWrap}>
              <Text style={styles.sessionPoints}>+{session.pointsEarned}</Text>
              <Text style={styles.sessionPointsLabel}>pts</Text>
            </View>
          </View>
        ))}
        {state.focusHistory.length === 0 && (
          <Text style={styles.emptyText}>No sessions yet. Start your first focus session!</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  pointsBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  pointsText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.onSecondaryContainer,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  summaryDeco: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.1,
  },
  summaryDecoIcon: {
    fontSize: 80,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  summaryIcon: {
    fontSize: 18,
  },
  summaryCardLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  summaryCardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    marginBottom: Spacing.xs,
  },
  summaryUnit: {
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.8,
  },
  summaryCardSub: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.md,
    padding: 3,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  periodBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: FontSizes.md,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  periodTextActive: {
    color: Colors.onPrimary,
  },
  chartCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    marginBottom: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.md,
    marginLeft: -Spacing.lg,
  },
  categoryList: {
    gap: Spacing.lg,
  },
  categoryItem: {
    gap: Spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  categoryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryTime: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_700Bold',
  },
  categoryBarMini: {
    width: 80,
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  categoryBarMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    marginBottom: Spacing.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  sessionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sessionIcon: {
    fontSize: 18,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: FontSizes.sm,
    color: Colors.onSurface,
    fontWeight: '500',
    fontFamily: 'NunitoSans_500Medium',
  },
  sessionDuration: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  sessionPointsWrap: {
    alignItems: 'center',
  },
  sessionPoints: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: 'Literata_700Bold',
  },
  sessionPointsLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
    fontFamily: 'NunitoSans_400Regular',
  },
});
