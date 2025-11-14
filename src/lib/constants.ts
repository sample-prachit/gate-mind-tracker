/**
 * Constants used throughout the application
 */

export const STORAGE_KEYS = {
  STOPWATCH_RUNNING: 'stopwatch_isRunning',
  STOPWATCH_ELAPSED: 'stopwatch_elapsed',
  STOPWATCH_TIMESTAMP: 'stopwatch_timestamp',
} as const;

export const DATA_TYPES = {
  SUBJECTS: 'subjects',
  MOCK_TESTS: 'mock_tests',
  STUDY_SESSIONS: 'study_sessions',
} as const;

export const TEST_TYPES = {
  MOCK: 'mock',
  SUBJECT: 'subject',
  UNIT: 'unit',
} as const;

export const CHART_COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  ACCENT: 'hsl(var(--accent))',
  SUCCESS: 'hsl(var(--success))',
  WARNING: 'hsl(var(--warning))',
  DESTRUCTIVE: 'hsl(var(--destructive))',
} as const;

export const DATE_RANGES = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
} as const;
