import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppUsage } from '../types';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { formatTime } from '../utils/helpers';

interface Props {
  app: AppUsage;
  onToggleBlock?: (id: string) => void;
  showBlock?: boolean;
}

export default function AppUsageCard({ app, onToggleBlock, showBlock }: Props) {
  const usagePercent = Math.min((app.timeSpent / app.limit) * 100, 100);
  const isOverLimit = app.timeSpent > app.limit;

  return (
    <View style={[styles.card, app.blocked && styles.cardBlocked]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: app.color + '15' }]}>
          <Text style={styles.icon}>{app.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{app.name}</Text>
          <Text style={styles.category}>{app.category}</Text>
        </View>
        <View style={styles.right}>
          {showBlock ? (
            <TouchableOpacity
              style={[styles.blockBtn, app.blocked && styles.blockBtnActive]}
              onPress={() => onToggleBlock?.(app.id)}
            >
              <Text style={[styles.blockBtnText, app.blocked && styles.blockBtnTextActive]}>
                {app.blocked ? 'Blocked' : 'Block'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.usage, isOverLimit && styles.overLimit]}>
              <Text style={styles.usageValue}>{formatTime(app.timeSpent)}</Text>
              {' / '}{formatTime(app.limit)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(usagePercent, 100)}%`,
              backgroundColor: isOverLimit ? Colors.error : app.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
    ...Shadow.soft,
  },
  cardBlocked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed + '30',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
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
  category: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  overLimit: {
    color: Colors.error,
  },
  right: {
    alignItems: 'flex-end',
  },
  usage: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  usageValue: {
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_700Bold',
  },
  barBg: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  blockBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainer,
  },
  blockBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer + '30',
  },
  blockBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    fontFamily: 'NunitoSans_500Medium',
  },
  blockBtnTextActive: {
    color: Colors.primary,
  },
});
