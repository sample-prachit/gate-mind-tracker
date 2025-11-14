import { supabase } from './supabaseClient';

export interface StudentProgress {
  id?: string;
  student_id: string;
  subject: string;
  progress: Record<string, any>;
  updated_at?: string;
}

/**
 * Save or update student progress in the database
 * @param data - Student progress data including optional ID for updates
 * @returns Promise with result data or error
 */
export async function saveStudentProgress(data: StudentProgress) {
  const { id, ...rest } = data;
  let result;
  if (id) {
    // Update existing
    result = await supabase
      .from('student_progress')
      .update(rest)
      .eq('id', id)
      .select();
  } else {
    // Insert new
    result = await supabase
      .from('student_progress')
      .insert([rest])
      .select();
  }
  return result;
}

/**
 * Fetch progress records for a student, optionally filtered by subject type
 * @param student_id - The user ID to fetch progress for
 * @param subject - Optional subject type filter (subjects, mock_tests, study_sessions, scheduled_tasks)
 * @returns Promise with array of progress records
 * @throws Error if database query fails
 */
export async function fetchStudentProgress(student_id: string, subject?: string) {
  let query = supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', student_id);
  if (subject) query = query.eq('subject', subject);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Helper function to save any data type (subjects, mock tests, study sessions, scheduled tasks)
 * @param userId - The user ID
 * @param dataType - Type of data being saved (subjects, mock_tests, study_sessions, scheduled_tasks)
 * @param data - The actual data to save
 * @param recordId - Optional existing record ID for updates
 * @returns Promise with result data including new/updated record ID
 */
export async function saveUserData(
  userId: string,
  dataType: 'subjects' | 'mock_tests' | 'study_sessions' | 'scheduled_tasks',
  data: any,
  recordId?: string
) {
  const payload = {
    student_id: userId,
    subject: dataType,
    progress: { [dataType]: data },
  };

  if (recordId) {
    const result = await supabase
      .from('student_progress')
      .update(payload)
      .eq('id', recordId)
      .select();
    return result;
  } else {
    const result = await supabase
      .from('student_progress')
      .insert([payload])
      .select();
    return result;
  }
}

/**
 * Helper function to fetch any data type from the database
 * @param userId - The user ID
 * @param dataType - Type of data to fetch (subjects, mock_tests, study_sessions, scheduled_tasks)
 * @returns Promise with array of matching records
 * @throws Error if database query fails
 */
export async function fetchUserData(
  userId: string,
  dataType: 'subjects' | 'mock_tests' | 'study_sessions' | 'scheduled_tasks'
) {
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', userId)
    .eq('subject', dataType);
  
  if (error) throw error;
  return data;
}
