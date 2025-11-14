/**
 * Utility functions for date and time calculations
 */

/**
 * Calculate study streak based on consecutive days with study sessions
 * @param studySessions Array of study sessions
 * @returns Number of consecutive days with study activity
 */
export const calculateStreak = (studySessions: { date: string }[]): number => {
  if (studySessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const sortedDates = [...new Set(studySessions.map((s) => s.date))].sort().reverse();

  for (const date of sortedDates) {
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get array of dates for the last N days
 * @param days Number of days to retrieve
 * @returns Array of date strings in ISO format (YYYY-MM-DD)
 */
export const getLastNDays = (days: number): string[] => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

/**
 * Format hours to display string (e.g., "2.5h" or "2h 30m")
 * @param hours Number of hours
 * @param detailed Whether to show detailed format with minutes
 * @returns Formatted string
 */
export const formatHours = (hours: number, detailed: boolean = false): string => {
  if (!detailed) {
    return `${hours}h`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

/**
 * Calculate average score from tests
 * @param tests Array of tests with score and totalMarks
 * @returns Average percentage score
 */
export const calculateAverageScore = (
  tests: { score: number; totalMarks: number }[]
): number => {
  if (tests.length === 0) return 0;
  
  const totalPercentage = tests.reduce(
    (sum, test) => sum + (test.score / test.totalMarks) * 100,
    0
  );
  
  return totalPercentage / tests.length;
};

/**
 * Get study hours for current week
 * @param studySessions Array of study sessions
 * @returns Total hours studied this week
 */
export const getWeeklyStudyHours = (
  studySessions: { date: string; hours: number }[]
): number => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  return studySessions
    .filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart;
    })
    .reduce((sum, session) => sum + session.hours, 0);
};
