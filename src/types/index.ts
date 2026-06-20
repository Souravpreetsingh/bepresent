export interface AppUsage {
  id: string;
  name: string;
  category: AppCategory;
  timeSpent: number;
  limit: number;
  icon: string;
  color: string;
  blocked: boolean;
}

export type AppCategory = 'social' | 'entertainment' | 'productivity' | 'games' | 'other';

export interface FocusSession {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
  pointsEarned: number;
  interrupted: boolean;
}

export interface DailyLog {
  date: string;
  totalScreenTime: number;
  appUsage: AppUsage[];
  focusSessions: FocusSession[];
  points: number;
  goalsMet: boolean;
  weeklyReportSent: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'focus' | 'streak' | 'goals' | 'milestone';
}

export interface UserProfile {
  totalPoints: number;
  streak: number;
  longestStreak: number;
  level: number;
  weeklyGoal: number;
  dailyGoal: number;
  totalFocusMinutes: number;
  completedSessions: number;
}

export interface WeeklyDataPoint {
  day: string;
  screenTime: number;
  focusTime: number;
  points: number;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'completed';
