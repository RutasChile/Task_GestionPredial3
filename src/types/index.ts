export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  avatar_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  color: string;
  due_date: string | null;
  created_by: string;
  created_at: string;
  google_event_id: string | null;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
}