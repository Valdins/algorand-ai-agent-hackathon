/**
 * Prompt input component with examples
 */
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Example {
  title: string;
  prompt: string;
  icon: string;
}

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="prompt-input-container">
      <div class="input-card">
        <label for="prompt" class="label">
          <span class="label-text">Describe your smart contract</span>
          <span class="label-hint">Be specific about functionality and requirements</span>
        </label>

        <textarea
          id="prompt"
          [(ngModel)]="prompt"
          [disabled]="isDisabled"
          rows="6"
          class="textarea"
          [class.disabled]="isDisabled"
          placeholder="Example: Create a voting contract where users can submit proposals and vote on them. Each user can only vote once per proposal."
        ></textarea>

        <div class="actions">
          <button
            (click)="onSubmit()"
            [disabled]="isDisabled || !prompt.trim()"
            class="btn btn-primary"
            [class.disabled]="isDisabled || !prompt.trim()"
          >
            <span *ngIf="!isDisabled" class="btn-content">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
              Generate & Deploy
            </span>
            <span *ngIf="isDisabled" class="btn-content">
              <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              Processing...
            </span>
          </button>

          <button
            *ngIf="showClear"
            (click)="onClear()"
            class="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="examples" *ngIf="!showClear">
        <h3 class="examples-title">✨ Quick Start Examples</h3>
        <div class="examples-grid">
          <div
            *ngFor="let example of examples"
            (click)="selectExample(example)"
            class="example-card"
          >
            <div class="example-icon">{{example.icon}}</div>
            <div class="example-content">
              <h4 class="example-title">{{example.title}}</h4>
              <p class="example-text">{{example.prompt}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prompt-input-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .label-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .label-hint {
      font-size: 0.875rem;
      color: #718096;
    }

    .textarea {
      width: 100%;
      padding: 1rem;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 0.95rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      resize: vertical;
      transition: all 0.2s;
      line-height: 1.6;
    }

    .textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .textarea.disabled {
      background: #f7fafc;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary.disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #2d3748;
      padding: 0.875rem 1.25rem;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .spinner {
      animation: rotate 1s linear infinite;
    }

    .spinner .path {
      stroke: currentColor;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }

    .examples {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .examples-title {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .example-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .example-card:hover {
      border-color: #667eea;
      background: #f7fafc;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .example-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .example-content {
      flex: 1;
    }

    .example-title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .example-text {
      margin: 0;
      font-size: 0.875rem;
      color: #718096;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .input-card, .examples {
        padding: 1.5rem;
      }

      .examples-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class PromptInputComponent implements OnInit {
  @Input() isDisabled = false;
  @Input() showClear = false;
  @Input() initialPrompt = '';
  @Output() submit = new EventEmitter<string>();
  @Output() promptSubmit = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  prompt = '';

  examples: Example[] = [
    {
      title: 'Counter Contract',
      prompt: 'Create a simple counter contract with increment and decrement methods',
      icon: '🔢'
    },
    {
      title: 'Voting System',
      prompt: 'Create a voting contract where users can create proposals and vote on them. Each user can only vote once per proposal.',
      icon: '🗳️'
    },
    {
      title: 'Token Swap',
      prompt: 'Create a token swap contract that allows users to exchange two different tokens at a fixed rate',
      icon: '🔄'
    },
    {
      title: 'Escrow Contract',
      prompt: 'Create an escrow contract that holds funds until both buyer and seller agree to release them',
      icon: '🔒'
    }
  ];

  ngOnInit(): void {
    // Set initial prompt if provided
    if (this.initialPrompt) {
      this.prompt = this.initialPrompt;
    }
  }

  selectExample(example: Example): void {
    this.prompt = example.prompt;
  }

  onSubmit(): void {
    if (this.prompt.trim() && !this.isDisabled) {
      const trimmedPrompt = this.prompt.trim();
      this.submit.emit(trimmedPrompt);
      this.promptSubmit.emit(trimmedPrompt);
    }
  }

  onClear(): void {
    this.prompt = '';
    this.clear.emit();
  }
}
