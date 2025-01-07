/*
  # Initial Schema Setup for Task Management System

  1. New Tables
    - `users` (extends auth.users)
      - `id` (uuid, primary key)
      - `email` (text)
      - `full_name` (text)
      - `role` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `color` (text)
      - `due_date` (timestamp)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `google_event_id` (text)

    - `task_assignments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `assigned_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for task creation and viewing
    - Add policies for task assignments
*/

-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color text DEFAULT '#808080',
  due_date timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  google_event_id text
);

-- Create task assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for tasks table
CREATE POLICY "Users can view assigned tasks"
  ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_assignments
      WHERE task_id = tasks.id AND user_id = auth.uid()
    )
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policies for task assignments
CREATE POLICY "Admins can manage task assignments"
  ON task_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their assignments"
  ON task_assignments
  FOR SELECT
  USING (user_id = auth.uid());