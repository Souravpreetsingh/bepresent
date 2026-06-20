import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../src/store/AppContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { formatSecondsToTimer } from '../../src/utils/helpers';
import AppUsageCard from '../../src/components/AppUsageCard';

const FOCUS_OPTIONS = [15, 25, 40, 50];

export default function FocusScreen() {
  const { state, startFocus, pauseFocus, resumeFocus, tickTimer, interruptFocus, toggleBlockApp, completeFocus } = useApp();
  const insets = useSafeAreaInsets();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = state.timerState === 'running' || state.timerState === 'paused';
  const totalSeconds = state.focusDuration * 60;
  const progress = totalSeconds > 0 ? 1 - state.timerSeconds / totalSeconds : 0;

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - progress * circumference;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (state.timerState === 'running' || state.timerState === 'break') {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.timerState, tickTimer]);

  useEffect(() => {
    if (state.timerState === 'completed') {
      Vibration.vibrate(500);
    }
  }, [state.timerState]);

  const handleComplete = useCallback(() => {
    completeFocus();
  }, [completeFocus]);

  const handleInterrupt = useCallback(() => {
    interruptFocus();
  }, [interruptFocus]);

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
            <Text style={styles.appName}>Terra Focus</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsIcon}>{'\uD83D\uDD25'}</Text>
            <Text style={styles.pointsText}>{state.user.totalPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        <View style={styles.immersiveBg} />

        <View style={styles.timerContainer}>
          {/* Status */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, state.timerState === 'running' && styles.statusBadgeActive]}>
              <View style={[styles.statusDot, state.timerState === 'running' && styles.statusDotActive]} />
              <Text style={styles.statusText}>
                {state.timerState === 'idle' && 'Ready'}
                {state.timerState === 'running' && 'Deep Focus'}
                {state.timerState === 'paused' && 'Paused'}
                {state.timerState === 'completed' && 'Complete!'}
                {state.timerState === 'break' && 'Break Time'}
              </Text>
            </View>
            <Text style={styles.statusTitle}>
              {state.timerState === 'idle' && 'Choose your focus'}
              {state.timerState === 'running' && 'Stay present'}
              {state.timerState === 'paused' && 'Take a breath'}
              {state.timerState === 'completed' && 'Well done!'}
              {state.timerState === 'break' && 'Rest your mind'}
            </Text>
          </View>

          {/* Timer Circle */}
          <View style={[styles.timerCircle, Shadow.medium]}>
            <View style={styles.timerRingBg}>
              <View
                style={[
                  styles.timerRingFill,
                  {
                    borderColor:
                      state.timerState === 'completed'
                        ? Colors.primary
                        : state.timerState === 'break'
                        ? Colors.tertiary
                        : Colors.primary,
                    transform: [{ rotateZ: `${-90 + progress * 360}deg` }],
                  },
                ]}
              />
            </View>
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>
                {state.timerState === 'completed'
                  ? 'Done!'
                  : state.timerState === 'break'
                  ? formatSecondsToTimer(state.timerSeconds)
                  : formatSecondsToTimer(state.timerSeconds)}
              </Text>
              <Text style={styles.timerLabel}>
                {state.timerState === 'completed'
                  ? '+ points earned'
                  : state.timerState === 'break'
                  ? '5 min break'
                  : 'Remaining'}
              </Text>
            </View>
          </View>

          {/* Duration options */}
          {state.timerState === 'idle' && (
            <View style={styles.durationRow}>
              {FOCUS_OPTIONS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={styles.durationBtn}
                  onPress={() => startFocus(mins)}
                >
                  <Text style={styles.durationText}>{mins}</Text>
                  <Text style={styles.durationLabel}>min</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Controls */}
          {isActive && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlSecondary]}
                onPress={handleInterrupt}
              >
                <Text style={styles.controlText}>End Session</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlPrimary]}
                onPress={state.timerState === 'running' ? pauseFocus : resumeFocus}
              >
                <Text style={styles.controlText}>
                  {state.timerState === 'running' ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {state.timerState === 'completed' && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlPrimary]}
                onPress={handleComplete}
              >
                <Text style={styles.controlText}>Start Break</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, styles.controlSecondary]}
                onPress={() => startFocus(state.focusDuration)}
              >
                <Text style={styles.controlText}>Focus Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {state.timerState === 'break' && (
            <TouchableOpacity
              style={[styles.controlBtn, styles.controlPrimary, { alignSelf: 'center' }]}
              onPress={() => startFocus(state.focusDuration)}
            >
              <Text style={styles.controlText}>Next Focus</Text>
            </TouchableOpacity>
          )}

          {/* Blocked apps notice */}
          {isActive && (
            <View style={[styles.blockNotice, Shadow.soft]}>
              <View style={styles.blockNoticeIcon}>
                <Text style={styles.blockNoticeEmoji}>{'\u2705'}</Text>
              </View>
              <View style={styles.blockNoticeText}>
                <Text style={styles.blockNoticeTitle}>Distractions Blocked</Text>
                <Text style={styles.blockNoticeDesc}>
                  {state.blockedApps.length} app{state.blockedApps.length !== 1 ? 's' : ''} and notifications are currently muted.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Block distractions section */}
        <View style={styles.blockSection}>
          <Text style={styles.sectionTitle}>Block Distractions</Text>
          <Text style={styles.sectionSub}>
            Apps to block during focus sessions
          </Text>
          {state.apps
            .filter((a) => a.category === 'social' || a.category === 'games' || a.category === 'entertainment')
            .map((app) => (
              <AppUsageCard
                key={app.id}
                app={app}
                showBlock
                onToggleBlock={toggleBlockApp}
              />
            ))}
        </View>
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
    marginBottom: Spacing.lg,
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
    borderColor: Colors.surface,
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
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '30',
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
  immersiveBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.08,
    borderRadius: 200,
    transform: [{ scaleX: 2 }],
    pointerEvents: 'none',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  statusRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusBadgeActive: {
    backgroundColor: Colors.primaryFixed,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.onSurfaceVariant,
  },
  statusDotActive: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  statusTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    marginTop: Spacing.md,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    position: 'relative',
  },
  timerRingBg: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: Colors.surfaceVariant,
  },
  timerRingFill: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    fontFamily: 'NunitoSans_400Regular',
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  durationBtn: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
    ...Shadow.soft,
  },
  durationText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  durationLabel: {
    fontSize: FontSizes.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  controlBtn: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 130,
  },
  controlPrimary: {
    backgroundColor: Colors.primary,
  },
  controlSecondary: {
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '50',
  },
  controlText: {
    color: Colors.onPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontFamily: 'NunitoSans_700Bold',
  },
  blockNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '20',
  },
  blockNoticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockNoticeEmoji: {
    fontSize: 18,
  },
  blockNoticeText: {
    flex: 1,
  },
  blockNoticeTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.onSurface,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  blockNoticeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    fontFamily: 'NunitoSans_400Regular',
    marginTop: 2,
    lineHeight: 20,
  },
  blockSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: 'Literata_700Bold',
  },
  sectionSub: {
    fontSize: FontSizes.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    marginBottom: Spacing.md,
    fontFamily: 'NunitoSans_400Regular',
  },
});
