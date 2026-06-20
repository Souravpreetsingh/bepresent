import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUsage, FocusSession, DailyLog, Reward, UserProfile, TimerState } from '../types';
import { DEFAULT_APPS, DEFAULT_REWARDS } from '../utils/mockData';
import { calculateLevel, calculatePointsForDuration, getDateString } from '../utils/helpers';

interface AppState {
  user: UserProfile;
  apps: AppUsage[];
  rewards: Reward[];
  dailyLog: DailyLog;
  focusHistory: FocusSession[];
  timerState: TimerState;
  timerSeconds: number;
  focusDuration: number;
  blockedApps: string[];
  isLoading: boolean;
  weeklyReport: DailyLog[];
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'START_FOCUS'; payload: number }
  | { type: 'PAUSE_FOCUS' }
  | { type: 'RESUME_FOCUS' }
  | { type: 'TICK_TIMER' }
  | { type: 'COMPLETE_FOCUS'; payload: { session: FocusSession; blockedApps: string[] } }
  | { type: 'INTERRUPT_FOCUS' }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'UPDATE_APP_USAGE'; payload: AppUsage[] }
  | { type: 'TOGGLE_BLOCK_APP'; payload: string }
  | { type: 'UNLOCK_REWARD'; payload: string }
  | { type: 'UPDATE_DAILY_LOG'; payload: Partial<DailyLog> }
  | { type: 'UPDATE_WEEKLY_REPORT'; payload: DailyLog[] }
  | { type: 'RESET_TIMER' }
  | { type: 'START_BREAK' };

const initialApps = DEFAULT_APPS.map((a) => ({ ...a }));
const initialRewards = DEFAULT_REWARDS.map((r) => ({ ...r }));

const initialUser: UserProfile = {
  totalPoints: 0,
  streak: 0,
  longestStreak: 0,
  level: 1,
  weeklyGoal: 300,
  dailyGoal: 120,
  totalFocusMinutes: 0,
  completedSessions: 0,
};

const createEmptyDailyLog = (): DailyLog => ({
  date: getDateString(),
  totalScreenTime: 0,
  appUsage: initialApps.map((a) => ({ ...a })),
  focusSessions: [],
  points: 0,
  goalsMet: false,
  weeklyReportSent: false,
});

const initialState: AppState = {
  user: initialUser,
  apps: initialApps,
  rewards: initialRewards,
  dailyLog: createEmptyDailyLog(),
  focusHistory: [],
  timerState: 'idle',
  timerSeconds: 0,
  focusDuration: 25,
  blockedApps: [],
  isLoading: true,
  weeklyReport: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoading: false };

    case 'START_FOCUS': {
      const duration = action.payload;
      return {
        ...state,
        timerState: 'running',
        timerSeconds: duration * 60,
        focusDuration: duration,
      };
    }

    case 'PAUSE_FOCUS':
      return { ...state, timerState: 'paused' };

    case 'RESUME_FOCUS':
      return { ...state, timerState: 'running' };

    case 'TICK_TIMER': {
      const newSeconds = state.timerSeconds - 1;
      if (newSeconds <= 0) {
        if (state.timerState === 'break') {
          return { ...state, timerState: 'idle', timerSeconds: 0 };
        }
        const session: FocusSession = {
          id: Date.now().toString(),
          date: getDateString(),
          duration: state.focusDuration,
          completed: true,
          pointsEarned: calculatePointsForDuration(state.focusDuration),
          interrupted: false,
        };
        const points = calculatePointsForDuration(state.focusDuration);
        const newUser = {
          ...state.user,
          totalPoints: state.user.totalPoints + points,
          totalFocusMinutes: state.user.totalFocusMinutes + state.focusDuration,
          completedSessions: state.user.completedSessions + 1,
        };
        const newLog: DailyLog = {
          ...state.dailyLog,
          focusSessions: [...state.dailyLog.focusSessions, session],
          points: state.dailyLog.points + points,
        };
        const updatedApps = state.apps.map((a) => ({
          ...a,
          blocked: state.blockedApps.includes(a.id),
        }));
        return {
          ...state,
          timerState: 'completed',
          timerSeconds: 0,
          user: newUser,
          dailyLog: newLog,
          focusHistory: [...state.focusHistory, session],
          apps: updatedApps,
          blockedApps: [],
        };
      }
      return { ...state, timerSeconds: newSeconds };
    }

    case 'COMPLETE_FOCUS': {
      const { session, blockedApps } = action.payload;
      const updatedApps = state.apps.map((a) => ({
        ...a,
        blocked: false,
      }));
      return {
        ...state,
        timerState: 'idle',
        timerSeconds: 0,
        focusHistory: [...state.focusHistory, session],
        dailyLog: {
          ...state.dailyLog,
          focusSessions: [...state.dailyLog.focusSessions, session],
          points: state.dailyLog.points + session.pointsEarned,
        },
        user: {
          ...state.user,
          totalPoints: state.user.totalPoints + session.pointsEarned,
          totalFocusMinutes: state.user.totalFocusMinutes + session.duration,
          completedSessions: state.user.completedSessions + 1,
        },
        apps: updatedApps,
        blockedApps: [],
      };
    }

    case 'INTERRUPT_FOCUS': {
      const currentMinutes = Math.floor((state.focusDuration * 60 - state.timerSeconds) / 60);
      const partialPoints = calculatePointsForDuration(currentMinutes);
      const session: FocusSession = {
        id: Date.now().toString(),
        date: getDateString(),
        duration: currentMinutes,
        completed: false,
        pointsEarned: partialPoints,
        interrupted: true,
      };
      const updatedApps = state.apps.map((a) => ({
        ...a,
        blocked: false,
      }));
      return {
        ...state,
        timerState: 'idle',
        timerSeconds: 0,
        focusHistory: [...state.focusHistory, session],
        dailyLog: {
          ...state.dailyLog,
          focusSessions: [...state.dailyLog.focusSessions, session],
          points: state.dailyLog.points + partialPoints,
        },
        user: {
          ...state.user,
          totalPoints: state.user.totalPoints + partialPoints,
          totalFocusMinutes: state.user.totalFocusMinutes + currentMinutes,
        },
        apps: updatedApps,
        blockedApps: [],
      };
    }

    case 'ADD_POINTS':
      return {
        ...state,
        user: { ...state.user, totalPoints: state.user.totalPoints + action.payload },
      };

    case 'UPDATE_APP_USAGE':
      return { ...state, apps: action.payload };

    case 'TOGGLE_BLOCK_APP': {
      const appId = action.payload;
      const blocked = state.blockedApps.includes(appId)
        ? state.blockedApps.filter((id) => id !== appId)
        : [...state.blockedApps, appId];
      return { ...state, blockedApps: blocked };
    }

    case 'UNLOCK_REWARD': {
      const rewards = state.rewards.map((r) =>
        r.id === action.payload ? { ...r, unlocked: true, unlockedDate: getDateString() } : r
      );
      return { ...state, rewards };
    }

    case 'UPDATE_DAILY_LOG':
      return { ...state, dailyLog: { ...state.dailyLog, ...action.payload } };

    case 'UPDATE_WEEKLY_REPORT':
      return { ...state, weeklyReport: action.payload };

    case 'RESET_TIMER':
      return { ...state, timerState: 'idle', timerSeconds: 0, blockedApps: [] };

    case 'START_BREAK':
      return { ...state, timerState: 'break', timerSeconds: 5 * 60 };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startFocus: (minutes: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  tickTimer: () => void;
  completeFocus: () => void;
  interruptFocus: () => void;
  toggleBlockApp: (appId: string) => void;
  unlockReward: (rewardId: string) => void;
  checkAndUpdateStreak: () => void;
  checkDailyGoal: () => void;
  saveState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@bepresent_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveState();
      }, 1000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state.user, state.rewards, state.focusHistory, state.dailyLog]);

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getDateString();
        const dailyLog = parsed.dailyLog && parsed.dailyLog.date === today
          ? parsed.dailyLog
          : createEmptyDailyLog();
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            user: parsed.user || initialUser,
            apps: parsed.apps || initialApps,
            rewards: parsed.rewards || initialRewards,
            dailyLog,
            focusHistory: parsed.focusHistory || [],
            weeklyReport: parsed.weeklyReport || [],
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveState = async () => {
    try {
      const data = JSON.stringify({
        user: state.user,
        apps: state.apps,
        rewards: state.rewards,
        dailyLog: state.dailyLog,
        focusHistory: state.focusHistory.slice(-100),
        weeklyReport: state.weeklyReport,
      });
      await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch {
      // silent fail
    }
  };

  const startFocus = useCallback((minutes: number) => {
    dispatch({ type: 'START_FOCUS', payload: minutes });
  }, []);

  const pauseFocus = useCallback(() => dispatch({ type: 'PAUSE_FOCUS' }), []);
  const resumeFocus = useCallback(() => dispatch({ type: 'RESUME_FOCUS' }), []);

  const tickTimer = useCallback(() => {
    dispatch({ type: 'TICK_TIMER' });
  }, []);

  const completeFocus = useCallback(() => {
    if (state.timerState === 'completed') {
      dispatch({ type: 'START_BREAK' });
    }
  }, [state.timerState]);

  const interruptFocus = useCallback(() => {
    dispatch({ type: 'INTERRUPT_FOCUS' });
  }, []);

  const toggleBlockApp = useCallback((appId: string) => {
    dispatch({ type: 'TOGGLE_BLOCK_APP', payload: appId });
  }, []);

  const unlockReward = useCallback((rewardId: string) => {
    dispatch({ type: 'UNLOCK_REWARD', payload: rewardId });
  }, []);

  const checkAndUpdateStreak = useCallback(() => {
    const today = getDateString();
    const yesterday = getDateString(new Date(Date.now() - 86400000));
    const hasSessionToday = state.dailyLog.focusSessions.some((s) => s.completed);
    const hasSessionYesterday = state.focusHistory.some(
      (s) => s.date === yesterday && s.completed
    );
    if (hasSessionToday && state.user.streak === 0) {
      dispatch({ type: 'LOAD_STATE', payload: { user: { ...state.user, streak: 1 } } });
    }
  }, [state.dailyLog, state.focusHistory, state.user]);

  const checkDailyGoal = useCallback(() => {
    const totalFocus = state.dailyLog.focusSessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
    if (totalFocus >= state.user.dailyGoal) {
      dispatch({ type: 'UPDATE_DAILY_LOG', payload: { goalsMet: true } });
    }
  }, [state.dailyLog, state.user.dailyGoal]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        startFocus,
        pauseFocus,
        resumeFocus,
        tickTimer,
        completeFocus,
        interruptFocus,
        toggleBlockApp,
        unlockReward,
        checkAndUpdateStreak,
        checkDailyGoal,
        saveState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
