import { WeeklyDataPoint, FocusSession } from '../types';

export function formatTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function formatMinutesToTimer(minutes: number): string {
  const mins = Math.floor(minutes / 60);
  const secs = minutes % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatSecondsToTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getDayLabel(date: Date = new Date()): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    dates.push(getDateString(d));
  }
  return dates;
}

export function getDayLabels(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export function generateWeeklyData(sessions: FocusSession[]): WeeklyDataPoint[] {
  const weekDates = getWeekDates();
  return weekDates.map((date) => {
    const daySessions = sessions.filter((s) => s.date === date);
    const focusTime = daySessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0);
    const points = daySessions.reduce((sum, s) => sum + (s.completed ? s.pointsEarned : 0), 0);
    const screenTime = Math.max(0, 240 - focusTime + Math.floor(Math.random() * 60));
    return {
      day: getDayLabel(new Date(date)),
      screenTime,
      focusTime,
      points,
    };
  });
}

export function calculateLevel(points: number): number {
  return Math.floor(points / 500) + 1;
}

export function calculatePointsForDuration(minutes: number): number {
  if (minutes < 10) return 0;
  if (minutes < 25) return Math.floor(minutes / 5) * 2;
  return Math.floor(minutes / 5) * 3;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '\uD83D\uDD25';
  if (streak >= 14) return '\uD83C\uDF1F';
  if (streak >= 7) return '\uD83D\uDD11';
  if (streak >= 3) return '\uD83D\uDCA5';
  return '\uD83D\uDD25';
}

export function getLevelTitle(level: number): string {
  if (level >= 20) return 'Focus Legend';
  if (level >= 15) return 'Productivity Master';
  if (level >= 10) return 'Concentration Guru';
  if (level >= 7) return 'Focus Apprentice';
  if (level >= 5) return 'Mindful Starter';
  if (level >= 3) return 'Beginner Focuser';
  return 'Newcomer';
}
