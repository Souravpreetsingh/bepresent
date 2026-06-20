import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../src/store/AppContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { calculateLevel, getLevelTitle, getStreakEmoji, formatTime } from '../../src/utils/helpers';
import RewardCard from '../../src/components/RewardCard';

export default function RewardsScreen() {
  const { state, unlockReward } = useApp();
  const insets = useSafeAreaInsets();

  const level = calculateLevel(state.user.totalPoints);
  const nextLevelPoints = level * 500;
  const currentLevelPoints = (level - 1) * 500;
  const progressInLevel = Math.min((state.user.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints), 1);

  const unlockedCount = state.rewards.filter((r) => r.unlocked).length;
  const recentUnlocks = state.rewards.filter((r) => r.unlocked).slice(-3);

  const weeklyFocusMinutes = state.focusHistory
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    })
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

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
            </View>
            <View>
              <Text style={styles.appName}>Terra Focus</Text>
              <Text style={styles.levelTitle}>{getLevelTitle(level)}</Text>
            </View>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsIcon}>{'\uD83C\uDF3F'}</Text>
            <Text style={styles.pointsText}>{state.user.totalPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* Status Hero Card */}
        <View style={[styles.heroCard, Shadow.soft]}>
          <View style={styles.heroDeco} />
          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Current Status</Text>
                <Text style={styles.heroLevel}>Level {level}</Text>
                <Text style={styles.heroLevelTitle}>{getLevelTitle(level)}</Text>
              </View>
              <View style={styles.heroIconWrap}>
                <Text style={styles.heroIcon}>{'\uD83C\uDF3F'}</Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Progress to Level {level + 1}</Text>
                <Text style={styles.progressNumbers}>
                  {state.user.totalPoints.toLocaleString()} / {nextLevelPoints.toLocaleString()} pts
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressInLevel * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{getStreakEmoji(state.user.streak)}</Text>
            <Text style={styles.quickStatLabel}>
              {state.user.streak > 0 ? `${state.user.streak}d streak` : 'No streak'}
            </Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{unlockedCount}/{state.rewards.length}</Text>
            <Text style={styles.quickStatLabel}>Badges earned</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{formatTime(weeklyFocusMinutes)}</Text>
            <Text style={styles.quickStatLabel}>This week</Text>
          </View>
        </View>

        {/* Earned Badges */}
        {recentUnlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgesRow}>
              {recentUnlocks.map((r) => (
                <View key={r.id} style={[styles.badgeCard, Shadow.soft]}>
                  <View style={styles.badgeIconWrap}>
                    <Text style={styles.badgeIcon}>{r.icon}</Text>
                  </View>
                  <Text style={styles.badgeName}>{r.name}</Text>
                  <Text style={styles.badgeDesc}>{r.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Challenges</Text>
          <View style={[styles.challengeCard, Shadow.soft]}>
            <View style={styles.challengeLeft}>
              <View style={styles.challengeIconWrap}>
                <Text style={styles.challengeIcon}>{'\uD83D\uDD25'}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>Weekend Warrior</Text>
                <Text style={styles.challengeDesc}>Complete 4 hours of focus time this weekend.</Text>
              </View>
            </View>
            <View style={styles.challengeRight}>
              <Text style={styles.challengePoints}>+300 pts</Text>
            </View>
          </View>
          <View style={[styles.challengeCard, Shadow.soft]}>
            <View style={styles.challengeLeft}>
              <View style={[styles.challengeIconWrap, { backgroundColor: Colors.primaryFixed }]}>
                <Text style={styles.challengeIcon}>{'\uD83C\uDF3F'}</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>Digital Detox</Text>
                <Text style={styles.challengeDesc}>No phone unlocks during morning focus session.</Text>
              </View>
            </View>
            <View style={styles.challengeRight}>
              <Text style={styles.challengePoints}>+150 pts</Text>
            </View>
          </View>
        </View>

        {/* All Achievements */}
        <Text style={styles.sectionTitle}>All Achievements</Text>
        <Text style={styles.sectionSub}>
          Spend your points to unlock rewards and level up
        </Text>
        {state.rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            userPoints={state.user.totalPoints}
            onUnlock={unlockReward}
          />
        ))}
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  avatarText: {
    fontSize: 20,
  },
  appName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'Literata_700Bold',
  },
  levelTitle: {
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
  heroCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  heroDeco: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.15,
    transform: [{ translateY: -60 }, { translateX: 60 }],
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  heroLabel: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    fontFamily: 'NunitoSans_500Medium',
  },
  heroLevel: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    letterSpacing: -1,
  },
  heroLevelTitle: {
    fontSize: FontSizes.lg,
    color: Colors.tertiary,
    fontStyle: 'italic',
    fontFamily: 'Literata_400Regular_Italic',
    marginTop: 2,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
  },
  heroIcon: {
    fontSize: 32,
  },
  progressSection: {
    marginTop: Spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  progressNumbers: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  quickStat: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
    ...Shadow.soft,
  },
  quickStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  quickStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    marginBottom: Spacing.sm,
  },
  sectionSub: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.lg,
    fontFamily: 'NunitoSans_400Regular',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  badgeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.tertiaryContainer + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  challengeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  challengeIcon: {
    fontSize: 22,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  challengeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
    marginTop: 2,
  },
  challengeRight: {
    marginLeft: Spacing.md,
  },
  challengePoints: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryContainer + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    fontFamily: 'NunitoSans_700Bold',
    overflow: 'hidden',
  },
});
