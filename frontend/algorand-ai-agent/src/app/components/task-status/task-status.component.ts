/**
 * Task status component with progress visualization
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-card" *ngIf="task">
      <div class="status-header">
        <h3 class="status-title">Task Status</h3>
        <span class="status-badge" [class]="'status-' + task.status">
          {{getStatusText(task.status)}}
        </span>
      </div>

      <div class="task-info">
        <div class="info-row">
          <span class="info-label">Task ID:</span>
          <code class="info-value">{{task.id}}</code>
        </div>
        <div class="info-row" *ngIf="task.result?.project_name">
          <span class="info-label">Project:</span>
          <span class="info-value">{{task.result?.project_name}}</span>
        </div>
      </div>

      <div class="progress-bar" *ngIf="isProcessing()">
        <div class="progress-fill"></div>
      </div>

      <div class="logs-section" *ngIf="task.logs.length > 0">
        <h4 class="logs-title">📋 Execution Logs</h4>
        <div class="logs-container">
          <div class="log-entry" *ngFor="let log of task.logs" [innerHTML]="formatLog(log)"></div>
        </div>
      </div>

      <div class="result-section" *ngIf="task.result && task.status === 'completed'">
        <div class="result-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#48bb78" opacity="0.2"/>
            <path d="M9 12l2 2 4-4" stroke="#48bb78" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h4 class="result-title">Deployment Successful</h4>
        </div>

        <div class="result-grid">
          <div class="result-item highlight" *ngIf="task.result.app_id && task.result.app_id !== '0'">
            <span class="result-label">App ID</span>
            <span class="result-value">{{task.result.app_id}}</span>
          </div>
          <div class="result-item" *ngIf="task.result.contract_name">
            <span class="result-label">Contract</span>
            <span class="result-value">{{task.result.contract_name}}</span>
          </div>
          <div class="result-item full-width" *ngIf="task.result.transaction_id">
            <span class="result-label">Transaction ID</span>
            <code class="result-value mono">{{task.result.transaction_id}}</code>
          </div>
        </div>

        <div class="result-message" *ngIf="task.result.message">
          <p>{{task.result.message}}</p>
        </div>
      </div>

      <div class="error-section" *ngIf="task.status === 'failed'">
        <div class="error-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#f56565" opacity="0.2"/>
            <path d="M12 8v4m0 4h.01" stroke="#f56565" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h4 class="error-title">Task Failed</h4>
        </div>
        <div class="error-content">
          <p class="error-message">{{getErrorSummary(task.error)}}</p>
          <details class="error-details" *ngIf="task.error && task.error.length > 200">
            <summary>Show full error details</summary>
            <pre class="error-trace">{{task.error}}</pre>
          </details>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .status-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .status-pending {
      background: #fef5e7;
      color: #d68910;
    }

    .status-in_progress {
      background: #ebf8ff;
      color: #2c5282;
    }

    .status-completed {
      background: #e6fffa;
      color: #276749;
    }

    .status-failed {
      background: #fff5f5;
      color: #c53030;
    }

    .task-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .info-row {
      display: flex;
      gap: 1rem;
    }

    .info-label {
      font-weight: 600;
      color: #4a5568;
      min-width: 80px;
    }

    .info-value {
      color: #2d3748;
      word-break: break-all;
    }

    code.info-value {
      background: #edf2f7;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .progress-bar {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
      background-size: 200% 100%;
      animation: progress 2s linear infinite;
    }

    @keyframes progress {
      0% {
        background-position: 0% 0%;
      }
      100% {
        background-position: 200% 0%;
      }
    }

    .logs-section {
      margin-bottom: 1.5rem;
    }

    .logs-title {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .logs-container {
      max-height: 300px;
      overflow-y: auto;
      background: #1a202c;
      border-radius: 8px;
      padding: 1rem;
    }

    .log-entry {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.85rem;
      color: #e2e8f0;
      line-height: 1.6;
      margin-bottom: 0.25rem;
    }

    .log-entry:last-child {
      margin-bottom: 0;
    }

    .result-section, .error-section {
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }

    .result-section {
      background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
      border-left: 4px solid #48bb78;
    }

    .error-section {
      background: linear-gradient(135deg, #fff5f5 0%, #fffaf0 100%);
      border-left: 4px solid #f56565;
    }

    .result-header, .error-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .result-title, .error-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #2d3748;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .result-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: white;
      border-radius: 6px;
    }

    .result-item.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .result-item.highlight .result-label {
      color: rgba(255, 255, 255, 0.9);
    }

    .result-item.highlight .result-value {
      color: white;
      font-size: 1.75rem;
    }

    .result-item.full-width {
      grid-column: 1 / -1;
    }

    .result-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .result-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .result-value.mono {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.85rem;
      word-break: break-all;
    }

    .result-message {
      padding: 1rem;
      background: white;
      border-radius: 6px;
    }

    .result-message p {
      margin: 0;
      color: #2d3748;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .error-message {
      margin: 0;
      color: #c53030;
      font-weight: 500;
      line-height: 1.6;
    }

    .error-details {
      cursor: pointer;
      user-select: none;
    }

    .error-details summary {
      padding: 0.75rem;
      background: white;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #718096;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-details summary::-webkit-details-marker {
      display: none;
    }

    .error-details summary::before {
      content: '▶';
      transition: transform 0.2s;
    }

    .error-details[open] summary::before {
      transform: rotate(90deg);
    }

    .error-trace {
      margin: 0.5rem 0 0 0;
      padding: 1rem;
      background: #1a202c;
      color: #e2e8f0;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    @media (max-width: 768px) {
      .status-card {
        padding: 1.5rem;
      }

      .result-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskStatusComponent {
  @Input() task: Task | null = null;

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  }

  isProcessing(): boolean {
    return this.task?.status === TaskStatus.PENDING ||
           this.task?.status === TaskStatus.IN_PROGRESS;
  }

  formatLog(log: string): string {
    // Highlight certain keywords
    let formatted = log
      .replace(/(PLANNER|RESEARCH|CODING|TESTING|DEPLOYMENT)/g, '<strong>$1</strong>')
      .replace(/(\[.*?\])/g, '<span style="color: #4299e1;">$1</span>');
    return formatted;
  }

  getErrorSummary(error: string | null | undefined): string {
    if (!error) {
      return 'An error occurred during task execution';
    }

    // Extract the first line or first meaningful error message
    const lines = error.split('\n');
    const firstLine = lines[0] || '';

    // If it's a short error, return as is
    if (error.length <= 200) {
      return error;
    }

    // Try to find a meaningful error message
    const errorMatch = error.match(/ERROR: ([^\n]+)/i) ||
                       error.match(/RuntimeError: ([^\n]+)/i) ||
                       error.match(/Error: ([^\n]+)/i);

    if (errorMatch) {
      return errorMatch[1];
    }

    // Return first line with ellipsis
    return firstLine.substring(0, 200) + '...';
  }
}
