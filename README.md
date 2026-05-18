# Terra Focus — BePresent Clone

A gamified screen time & focus control mobile app built with React Native (Expo). Set app usage limits, block distractions during focus sessions, and earn rewards for staying on task.

## Features

- **Dashboard** — Daily screen time balance, app usage tracking with limits, quick-start focus session
- **Focus Timer** — Pomodoro-style timer (15/25/40/50 min), pause/resume, break timer, app blocking toggle
- **Insights & History** — Weekly focus trends chart, screen time breakdown, app category distribution, session history
- **Rewards & Achievements** — Level/XP system, streak tracking, unlockable badges, weekly challenges
- **Gamification** — Earn points for completed focus sessions, level up, unlock achievements

## Design

Inspired by the **Terra** organic design system — warm cream backgrounds, forest green accents, soft rounded corners, and bento grid layouts. Earthy, calm, and human.

## Tech Stack

- **React Native** with Expo SDK 54
- **Expo Router** (file-based navigation)
- **react-native-chart-kit** for charts
- **AsyncStorage** for local persistence
- **react-native-svg** for progress rings
- **react-native-reanimated** for animations
- TypeScript throughout

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start

# Start with web
npx expo start --web
```

## Project Structure

```
app/                  # Expo Router screens
  (tabs)/
    index.tsx         # Dashboard
    focus.tsx         # Focus Timer
    stats.tsx         # Insights & History
    rewards.tsx       # Rewards & Achievements
    _layout.tsx       # Tab navigator
  _layout.tsx         # Root layout
src/
  components/         # Reusable UI components
  constants/          # Theme & colors
  store/              # State management (Context + Reducer)
  types/              # TypeScript types
  utils/              # Helpers & mock data
```

## Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Bento grid with hero card (today's balance), quick start focus, stats row, app usage cards, weekly trends |
| **Focus** | Timer circle with ring animation, duration selection, pause/stop controls, app block toggles |
| **Insights** | Focus/distraction summary cards, weekly line chart, app category breakdown, recent sessions |
| **Rewards** | Level progress hero, streak/badges stats, earned badges grid, upcoming challenges, all achievements |
