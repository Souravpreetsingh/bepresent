import { AppUsage, Reward } from '../types';

export const DEFAULT_APPS: AppUsage[] = [
  { id: '1', name: 'Instagram', category: 'social', timeSpent: 87, limit: 60, icon: '\uD83D\uDCF7', color: '#E1306C', blocked: false },
  { id: '2', name: 'TikTok', category: 'entertainment', timeSpent: 120, limit: 45, icon: '\uD83C\uDFB5', color: '#FF0050', blocked: false },
  { id: '3', name: 'YouTube', category: 'entertainment', timeSpent: 65, limit: 60, icon: '\uD83D\uDCFA', color: '#FF0000', blocked: false },
  { id: '4', name: 'Twitter/X', category: 'social', timeSpent: 42, limit: 30, icon: '\uD83D\uDC26', color: '#1DA1F2', blocked: false },
  { id: '5', name: 'WhatsApp', category: 'social', timeSpent: 55, limit: 45, icon: '\uD83D\uDCAC', color: '#25D366', blocked: false },
  { id: '6', name: 'Netflix', category: 'entertainment', timeSpent: 90, limit: 90, icon: '\uD83C\uDFAC', color: '#E50914', blocked: false },
  { id: '7', name: 'Slack', category: 'productivity', timeSpent: 35, limit: 60, icon: '\uD83D\uDCE7', color: '#4A154B', blocked: false },
  { id: '8', name: 'Candy Crush', category: 'games', timeSpent: 45, limit: 30, icon: '\uD83C\uDFAE', color: '#FF6B35', blocked: false },
];

export const DEFAULT_REWARDS: Reward[] = [
  { id: 'r1', name: 'First Focus', description: 'Complete your first focus session', pointsRequired: 10, icon: '\uD83C\uDFC6', unlocked: false, category: 'milestone' },
  { id: 'r2', name: 'Bronze Streak', description: 'Maintain a 3-day streak', pointsRequired: 50, icon: '\uD83E\uDD47', unlocked: false, category: 'streak' },
  { id: 'r3', name: 'Silver Streak', description: 'Maintain a 7-day streak', pointsRequired: 200, icon: '\uD83E\uDD48', unlocked: false, category: 'streak' },
  { id: 'r4', name: 'Gold Streak', description: 'Maintain a 14-day streak', pointsRequired: 500, icon: '\uD83E\uDD49', unlocked: false, category: 'streak' },
  { id: 'r5', name: 'Focus Hour', description: 'Complete 1 hour of total focus time', pointsRequired: 30, icon: '\u23F0', unlocked: false, category: 'focus' },
  { id: 'r6', name: 'Focus Marathon', description: 'Complete 10 hours of focus time', pointsRequired: 1000, icon: '\uD83C\uDFC3', unlocked: false, category: 'focus' },
  { id: 'r7', name: 'Goal Crusher', description: 'Meet your daily goal 5 times', pointsRequired: 100, icon: '\uD83C\uDFAF', unlocked: false, category: 'goals' },
  { id: 'r8', name: 'Weekly Warrior', description: 'Meet all weekly goals', pointsRequired: 300, icon: '\uD83D\uDEE1\uFE0F', unlocked: false, category: 'goals' },
  { id: 'r9', name: 'Deep Focus', description: 'Complete a 50-minute focus session', pointsRequired: 75, icon: '\uD83E\uDDD0', unlocked: false, category: 'focus' },
  { id: 'r10', name: 'Diamond Hands', description: '30-day streak achievement', pointsRequired: 3000, icon: '\uD83D\uDC8E', unlocked: false, category: 'streak' },
];
