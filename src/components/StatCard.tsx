import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

export default function StatCard({ icon, label, value, color = Colors.primary }: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
    ...Shadow.soft,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  value: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    fontFamily: 'Literata_700Bold',
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'NunitoSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
