import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Reward } from '../types';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';

interface Props {
  reward: Reward;
  userPoints: number;
  onUnlock: (id: string) => void;
}

export default function RewardCard({ reward, userPoints, onUnlock }: Props) {
  const canUnlock = userPoints >= reward.pointsRequired && !reward.unlocked;

  return (
    <TouchableOpacity
      style={[styles.card, reward.unlocked && styles.cardUnlocked]}
      onPress={() => canUnlock && onUnlock(reward.id)}
      disabled={!canUnlock}
      activeOpacity={canUnlock ? 0.7 : 1}
    >
      <View style={[styles.iconWrap, reward.unlocked && styles.iconWrapUnlocked]}>
        <Text style={styles.icon}>{reward.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{reward.name}</Text>
        <Text style={styles.description}>{reward.description}</Text>
      </View>
      <View style={styles.pointsSection}>
        {reward.unlocked ? (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>Unlocked</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.points, userPoints >= reward.pointsRequired && styles.pointsAfford]}>
              {reward.pointsRequired}
            </Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
    ...Shadow.soft,
  },
  cardUnlocked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed + '40',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  iconWrapUnlocked: {
    backgroundColor: Colors.primaryContainer + '30',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  pointsSection: {
    alignItems: 'center',
    minWidth: 60,
  },
  points: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    fontFamily: 'Literata_700Bold',
  },
  pointsAfford: {
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontFamily: 'NunitoSans_400Regular',
  },
  unlockedBadge: {
    backgroundColor: Colors.primaryContainer + '40',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  unlockedText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
});
