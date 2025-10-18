import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { WalletService } from '../../services/wallet.service';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Payment Required</h3>
          <button class="close-button" (click)="close()">×</button>
        </div>

        <div class="modal-body">
          <div *ngIf="!paymentStatus" class="payment-info">
            <div class="cost-display">
              <div class="cost-label">Deployment Cost</div>
              <div class="cost-amount">{{deploymentCost}} ALGO</div>
            </div>

            <div class="info-text">
              <p>To generate and deploy your smart contract, please send {{deploymentCost}} ALGO.</p>
              <p class="note">This covers AI generation, testing, and deployment to Algorand LocalNet.</p>
            </div>

            <div class="wallet-balance" *ngIf="walletBalance">
              <span class="balance-label">Your balance:</span>
              <span class="balance-amount">{{walletBalance.toFixed(2)}} ALGO</span>
            </div>

            <div *ngIf="walletBalance && walletBalance < deploymentCost" class="warning">
              ⚠️ Insufficient balance. You need at least {{deploymentCost}} ALGO.
            </div>

            <button
              class="pay-button"
              (click)="processPayment()"
              [disabled]="isProcessing || (walletBalance && walletBalance < deploymentCost)"
            >
              <span *ngIf="!isProcessing">Confirm Payment</span>
              <span *ngIf="isProcessing" class="loading">Processing...</span>
            </button>
          </div>

          <div *ngIf="paymentStatus === 'processing'" class="status-display">
            <div class="spinner"></div>
            <h4>Processing Payment</h4>
            <p>Please confirm the transaction in your wallet...</p>
          </div>

          <div *ngIf="paymentStatus === 'confirming'" class="status-display">
            <div class="spinner"></div>
            <h4>Confirming Transaction</h4>
            <p>Waiting for blockchain confirmation...</p>
          </div>

          <div *ngIf="paymentStatus === 'success'" class="status-display success">
            <svg class="check-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#48bb78" opacity="0.1"/>
              <path d="M20 32l8 8 16-16" stroke="#48bb78" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h4>Payment Successful!</h4>
            <p>Your smart contract is being generated...</p>
          </div>

          <div *ngIf="paymentStatus === 'error'" class="status-display error">
            <svg class="error-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#f56565" opacity="0.1"/>
              <path d="M24 24l16 16m0-16L24 40" stroke="#f56565" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <h4>Payment Failed</h4>
            <p>{{errorMessage}}</p>
            <button class="retry-button" (click)="resetPayment()">Try Again</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #2d3748;
      font-weight: 700;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 2rem;
      color: #718096;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #2d3748;
    }

    .modal-body {
      padding: 2rem;
    }

    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cost-display {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .cost-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cost-amount {
      font-size: 3rem;
      font-weight: 700;
    }

    .info-text p {
      margin: 0 0 0.75rem 0;
      color: #4a5568;
      line-height: 1.6;
    }

    .note {
      font-size: 0.875rem;
      color: #718096;
    }

    .wallet-balance {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .balance-label {
      color: #718096;
      font-weight: 500;
    }

    .balance-amount {
      color: #2d3748;
      font-weight: 600;
    }

    .warning {
      padding: 1rem;
      background: #fff5f5;
      border-left: 4px solid #f56565;
      border-radius: 4px;
      color: #c53030;
      font-weight: 500;
    }

    .pay-button {
      width: 100%;
      padding: 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .pay-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    }

    .pay-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      display: inline-block;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-display {
      text-align: center;
      padding: 2rem 0;
    }

    .status-display h4 {
      margin: 1rem 0 0.5rem 0;
      font-size: 1.5rem;
      color: #2d3748;
    }

    .status-display p {
      margin: 0;
      color: #718096;
    }

    .spinner {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .check-icon, .error-icon {
      margin-bottom: 1rem;
    }

    .success h4 {
      color: #48bb78;
    }

    .error h4 {
      color: #f56565;
    }

    .retry-button {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      font-weight: 600;
      color: #667eea;
      background: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .retry-button:hover {
      background: #667eea;
      color: white;
    }
  `]
})
export class PaymentModalComponent {
  @Input() isOpen = false;
  @Input() receiverAddress = '';
  @Output() paymentComplete = new EventEmitter<PaymentResult>();
  @Output() closed = new EventEmitter<void>();

  deploymentCost = 0.5;
  walletBalance: number | null = null;
  paymentStatus: 'processing' | 'confirming' | 'success' | 'error' | null = null;
  errorMessage = '';
  isProcessing = false;

  constructor(
    private paymentService: PaymentService,
    private walletService: WalletService
  ) {
    this.deploymentCost = this.paymentService.getDeploymentCost();
    const walletInfo = this.walletService.getCurrentWalletInfo();
    this.walletBalance = walletInfo.balance;
  }

  async processPayment(): Promise<void> {
    this.isProcessing = true;
    this.paymentStatus = 'processing';

    try {
      // Send payment
      const txnId = await this.paymentService.sendPayment(
        this.receiverAddress,
        this.deploymentCost
      );

      this.paymentStatus = 'confirming';

      // Wait a moment for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.paymentStatus = 'success';

      // Emit success after showing success message
      setTimeout(() => {
        this.paymentComplete.emit({
          success: true,
          transactionId: txnId
        });
      }, 1500);

    } catch (error: any) {
      this.paymentStatus = 'error';
      this.errorMessage = error.message || 'Failed to process payment. Please try again.';
      this.paymentComplete.emit({
        success: false,
        error: this.errorMessage
      });
    } finally {
      this.isProcessing = false;
    }
  }

  resetPayment(): void {
    this.paymentStatus = null;
    this.errorMessage = '';
  }

  close(): void {
    if (!this.isProcessing) {
      this.closed.emit();
    }
  }
}
