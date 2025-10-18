/**
 * Task models and interfaces
 */

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  logs: string[];
  result?: TaskResult;
  error?: string;
  created_at?: number;
  updated_at?: number;
}

export interface TaskResult {
  app_id: string;
  message: string;
  project_name?: string;
  contract_name?: string;
  transaction_id?: string;
  prompt_excerpt?: string;
}

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  task_id: string;
}

export interface TaskStatusResponse {
  status: string;
  logs: string[];
  result?: TaskResult;
  error?: string;
}
