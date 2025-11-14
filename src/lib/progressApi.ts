import { supabase } from './supabaseClient';

export interface StudentProgress {
  id?: string;
  student_id: string;
  subject: string;
  progress: Record<string, any>;
  updated_at?: string;
}

// Save or update student progress
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

// Fetch progress for a student (optionally by subject)
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
