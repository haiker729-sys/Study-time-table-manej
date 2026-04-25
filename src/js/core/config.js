/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APP_CONFIG = {
  name: 'Aether Study Planner',
  version: '1.2.0',
  debug: true,
  defaultTab: 'schedule',
  tabs: [
    { id: 'schedule', label: 'Schedule', icon: 'Calendar' },
    { id: 'tracker', label: 'Tracker', icon: 'Activity' },
    { id: 'focus', label: 'Focus', icon: 'Clock' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart' },
    { id: 'evolution', label: 'Evolution', icon: 'Zap' },
    { id: 'notes', label: 'Notes', icon: 'FileText' },
    { id: 'tips', label: 'Tips', icon: 'Lightbulb' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ],
  refreshInterval: 60000,
};

export const INITIAL_STATE = {
  currentTab: APP_CONFIG.defaultTab,
  user: {
    name: 'Explorer',
    goal: 'Excellence'
  },
  settings: {
    totalDays: 60,
    penaltyRules: 'No social media for 24h',
    rewardRules: 'Treat yourself to a snack',
    studyHours: 6,
    alertTiming: '08:00'
  },
  timetable: [],
  tracker: {},
  notes: [],
  focus: {
    timeLeft: 1500, // 25 mins
    isActive: false,
    isBreak: false,
    sessionsCompleted: 0
  },
  goals: {
    dailyTarget: 8,
    streak: 0,
    longestStreak: 0,
    lastCompletedDate: null
  },
  notifications: {
    enabled: true,
    lastChecked: null
  },
  gamification: {
    xp: 0,
    badges: []
  }
};
