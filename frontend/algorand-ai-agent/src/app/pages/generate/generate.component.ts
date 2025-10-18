import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PromptInputComponent } from '../../components/prompt-input/prompt-input.component';
import { TaskStatusComponent } from '../../components/task-status/task-status.component';
import { HeaderComponent } from '../../components/header/header.component';
import { WalletService } from '../../services/wallet.service';
import { TaskService } from '../../services/task.service';
import { PaymentService } from '../../services/payment.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [CommonModule, PromptInputComponent, TaskStatusComponent, HeaderComponent],
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit, OnDestroy {
  isWalletConnected = false;
  currentTask: Task | null = null;
  initialPrompt = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private walletService: WalletService,
    private taskService: TaskService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check wallet connection
    this.subscriptions.push(
      this.walletService.getWalletInfo().subscribe(info => {
        this.isWalletConnected = true;
      })
    );

    // Subscribe to current task updates
    this.subscriptions.push(
      this.taskService.getCurrentTask().subscribe(task => {
        this.currentTask = task;
      })
    );

    // Get initial prompt from query params (from example contracts)
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['prompt']) {
          this.initialPrompt = params['prompt'];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async onPromptSubmit(prompt: string): Promise<void> {
    if (!this.isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Show payment modal here
      // For now, just create the task without payment
      // In production, you would:
      // 1. Show payment modal
      // 2. Get payment confirmation (txId)
      // 3. Include payment details in the generate request

      // Create task and start polling
      this.taskService.createTask(prompt).subscribe({
        next: (taskId) => {
          console.log('Task created:', taskId);
        },
        error: (error) => {
          console.error('Failed to create task:', error);
          alert(`Failed to create task: ${error.message}`);
        }
      });
    } catch (error: any) {
      console.error('Error submitting prompt:', error);
      alert(`Error: ${error.message}`);
    }
  }

  scrollToHeader(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
