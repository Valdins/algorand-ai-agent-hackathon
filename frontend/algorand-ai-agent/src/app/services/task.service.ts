/**
 * Task Service for managing task state and polling
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { Task, TaskStatus } from '../models/task.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private currentTask$ = new BehaviorSubject<Task | null>(null);
  private pollSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  /**
   * Get the current task as an observable
   */
  getCurrentTask(): Observable<Task | null> {
    return this.currentTask$.asObservable();
  }

  /**
   * Create a new task and start polling for updates
   */
  createTask(prompt: string): Observable<string> {
    return new Observable(observer => {
      this.apiService.generateContract(prompt).subscribe({
        next: (response) => {
          const task: Task = {
            id: response.task_id,
            prompt: prompt,
            status: TaskStatus.PENDING,
            logs: []
          };

          this.currentTask$.next(task);
          this.startPolling(response.task_id);

          observer.next(response.task_id);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Start polling for task updates
   */
  private startPolling(taskId: string): void {
    this.stopPolling();

    this.pollSubscription = interval(1000)
      .pipe(
        switchMap(() => this.apiService.getTaskStatus(taskId)),
        takeWhile(response => {
          const status = response.status as TaskStatus;
          return status === TaskStatus.PENDING || status === TaskStatus.IN_PROGRESS;
        }, true)
      )
      .subscribe({
        next: (response) => {
          const currentTask = this.currentTask$.value;
          if (currentTask) {
            const updatedTask: Task = {
              ...currentTask,
              status: response.status as TaskStatus,
              logs: response.logs,
              result: response.result,
              error: response.error
            };
            this.currentTask$.next(updatedTask);
          }

          // Stop polling if task is complete or failed
          const status = response.status as TaskStatus;
          if (status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) {
            this.stopPolling();
          }
        },
        error: (error) => {
          console.error('Polling error:', error);
          this.stopPolling();
        }
      });
  }

  /**
   * Stop polling for updates
   */
  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  /**
   * Clear the current task
   */
  clearTask(): void {
    this.stopPolling();
    this.currentTask$.next(null);
  }

  /**
   * Get status text for display
   */
  getStatusText(status: TaskStatus): string {
    const statusMap: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: 'Pending',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed',
      [TaskStatus.FAILED]: 'Failed'
    };
    return statusMap[status] || status;
  }

  /**
   * Check if task is processing
   */
  isProcessing(status: TaskStatus): boolean {
    return status === TaskStatus.PENDING || status === TaskStatus.IN_PROGRESS;
  }
}
