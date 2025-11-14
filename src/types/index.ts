/**
 * Core type definitions for the GATE Mind Tracker application
 */

export type TestType = "mock" | "subject" | "unit";

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  color: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  completedHours: number;
  inProgressHours: number;
}

export interface Test {
  id: string;
  date: string;
  score: number;
  totalMarks: number;
  testType: TestType;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
}

export interface StudySession {
  id: string;
  date: string;
  hours: number;
}

export interface StudentProgress {
  id?: string;
  student_id: string;
  subject: string;
  progress: Record<string, any>;
  updated_at?: string;
}

export interface DashboardStats {
  studyStreak: number;
  totalStudyTime: number;
  averageScore: number;
  topicsCompleted: number;
  totalTopics: number;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  targetScore: number;
}
