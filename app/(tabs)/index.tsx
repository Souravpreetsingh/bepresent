import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/store/AppContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { formatTime, getLevelTitle, getStreakEmoji } from '../../src/utils/helpers';
import AppUsageCard from '../../src/components/AppUsageCard';
import StatCard from '../../src/components/StatCard';
import WeeklyReportCard from '../../src/components/WeeklyReportCard';
import { generateWeeklyData } from '../../src/utils/helpers';

export default function DashboardScreen() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const dailyTotal = state.dailyLog.focusSessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  const dailyProgress = Math.min(dailyTotal / state.user.dailyGoal, 1);

  const totalScreenTime = state.dailyLog.appUsage.reduce((s, a) => s + a.timeSpent, 0);
  const overLimitApps = state.dailyLog.appUsage.filter((a) => a.timeSpent > a.limit);

  const weeklyData = useMemo(
    () => generateWeeklyData(state.focusHistory),
    [state.focusHistory.length]
  );

  const isTodaysData = state.dailyLog.date === new Date().toISOString().split('T')[0];

  if (state.isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loading}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{'\uD83C\uDF3F'}</Text>
              </View>
              <View style={styles.streakDot} />
            </View>
            <View>
              <Text style={styles.appName}>Terra Focus</Text>
              <Text style={styles.levelText}>{getLevelTitle(state.user.level)}</Text>
            </View>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsIcon}>{'\uD83C\uDF3F'}</Text>
            <Text style={styles.pointsText}>{state.user.totalPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroDeco} />
            <View style={styles.heroContent}>
              <View style={styles.heroLabelRow}>
                <Text style={styles.heroLabelIcon}>{'\u23F0'}</Text>
                <Text style={styles.heroLabel}>Today's Balance</Text>
              </View>
              <Text style={styles.heroTime}>{formatTime(dailyTotal || 240 - Math.round(totalScreenTime / 60) * 60)}</Text>
              <Text style={styles.heroDesc}>
                {isTodaysData
                  ? 'Your screen time is beautifully balanced today.'
                  : 'Start your first focus session.'}
              </Text>
            </View>
            <View style={styles.heroChips}>
              <View style={[styles.chip, styles.chipTrack]}>
                <View style={styles.chipDot} />
                <Text style={styles.chipText}>{dailyProgress >= 1 ? 'Goal Met' : 'On Track'}</Text>
              </View>
              <View style={[styles.chip, styles.chipNeutral]}>
                <Text style={styles.chipTextNeutral}>Lv.{state.user.level}</Text>
              </View>
            </View>
          </View>

          {/* Quick Start Focus Card */}
          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={() => router.push('/(tabs)/focus')}
            activeOpacity={0.9}
          >
            <View style={styles.qsIconWrap}>
              <Text style={styles.qsIcon}>{'\uD83C\uDF3F'}</Text>
            </View>
            <Text style={styles.qsTitle}>Deep Focus</Text>
            <Text style={styles.qsDesc}>Start a 25-minute distraction-free session.</Text>
            <View style={styles.qsFooter}>
              <Text style={styles.qsFooterText}>Quick Start</Text>
              <Text style={styles.qsArrow}>{'\u2192'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon={'\u23F0'} label="Focus" value={formatTime(dailyTotal)} color={Colors.primary} />
          <StatCard icon={getStreakEmoji(state.user.streak)} label="Streak" value={`${state.user.streak}d`} color={Colors.tertiary} />
          <StatCard icon={'\u2B50'} label="Points" value={state.user.totalPoints.toString()} color={Colors.primary} />
        </View>

        {overLimitApps.length > 0 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertIcon}>{'\u26A0\uFE0F'}</Text>
            <Text style={styles.alertText}>
              {overLimitApps.length} app{overLimitApps.length > 1 ? 's' : ''} over limit today
            </Text>
          </View>
        )}

        {/* App Usage Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Digital Boundaries</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{'\u2022\u2022\u2022'}</Text>
          </TouchableOpacity>
        </View>
        {state.apps.slice(0, 4).map((app) => (
          <AppUsageCard key={app.id} app={app} />
        ))}

        {/* Weekly Overview */}
        <WeeklyReportCard data={weeklyData} compact />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    color: Colors.onSurfaceVariant,
    fontSize: FontSizes.lg,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrap: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  avatarText: {
    fontSize: 22,
  },
  streakDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  appName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'Literata_700Bold',
  },
  levelText: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  pointsIcon: {
    fontSize: 16,
  },
  pointsText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.onSecondaryContainer,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  heroCard: {
    flex: 1,
    minWidth: '60%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.soft,
  },
  heroDeco: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.3,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  heroLabelIcon: {
    fontSize: 16,
  },
  heroLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'NunitoSans_500Medium',
  },
  heroTime: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  heroDesc: {
    fontSize: FontSizes.md,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 22,
    maxWidth: '80%',
  },
  heroChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  chipTrack: {
    backgroundColor: Colors.primaryFixed,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.onPrimaryFixed,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  chipNeutral: {
    backgroundColor: Colors.surfaceVariant,
  },
  chipTextNeutral: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  quickStartCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    ...Shadow.medium,
  },
  qsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.onPrimary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  qsIcon: {
    fontSize: 28,
  },
  qsTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onPrimary,
    fontFamily: 'Literata_700Bold',
    marginBottom: Spacing.xs,
  },
  qsDesc: {
    fontSize: FontSizes.sm,
    color: Colors.onPrimary + 'CC',
    fontFamily: 'NunitoSans_400Regular',
    lineHeight: 20,
  },
  qsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xxl,
  },
  qsFooterText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.onPrimary,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  qsArrow: {
    fontSize: 20,
    color: Colors.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    marginHorizontal: -4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  alertIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  alertText: {
    color: Colors.onErrorContainer,
    fontSize: FontSizes.md,
    fontWeight: '500',
    fontFamily: 'NunitoSans_500Medium',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  seeAll: {
    fontSize: 20,
    color: Colors.onSurfaceVariant,
    padding: Spacing.sm,
  },
});
