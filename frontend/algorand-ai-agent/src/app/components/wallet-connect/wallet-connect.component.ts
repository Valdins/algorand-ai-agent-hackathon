import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WalletService, WalletInfo, WalletData } from '../../services/wallet.service';
import { WalletId } from '@txnlab/use-wallet';

@Component({
  selector: 'app-wallet-connect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wallet-connect">
      <!-- Not Connected State -->
<!--      <div *ngIf="!walletInfo.connected" class="connect-section">-->
<!--        <button class="wallet-button" (click)="showWalletModal = true">-->
<!--          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">-->
<!--            <path d="M17 8h-2V5a5 5 0 00-10 0v3H3a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 5a3 3 0 016 0v3H7V5z" fill="currentColor"/>-->
<!--          </svg>-->
<!--          <span>Connect Wallet</span>-->
<!--        </button>-->
<!--      </div>-->

      <!-- Connected State -->
      <div *ngIf="!walletInfo.connected" class="connected-section">
        <div class="wallet-info">
          <div class="network-badge">LocalNet</div>
          <div class="address">
            {{formatAddress(walletInfo.address!)}}
          </div>
          <div class="balance" style="color: #e2e8f0">
            {{walletInfo.balance.toFixed(2)}} ALGO
          </div>
        </div>
        <button class="disconnect-button" (click)="disconnect()">
          Disconnect
        </button>
      </div>

      <!-- Wallet Selection Modal -->
      <div *ngIf="showWalletModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 0.5rem; vertical-align: middle;">
                <path d="M17 8h-2V5a5 5 0 00-10 0v3H3a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 5a3 3 0 016 0v3H7V5z" fill="url(#wallet-gradient)"/>
                <defs>
                  <linearGradient id="wallet-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#667eea"/>
                    <stop offset="100%" stop-color="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
              Select wallet provider
            </h3>
            <button class="close-button" (click)="closeModal()">×</button>
          </div>

          <!-- Show Account Info if Connected -->
          <div *ngIf="walletInfo.connected" class="account-section">
            <div class="account-info">
              <div class="account-address">{{formatAddress(walletInfo.address!)}}</div>
              <div class="account-balance">{{walletInfo.balance.toFixed(2)}} ALGO</div>
              <div class="account-network">Network: LocalNet</div>
            </div>
            <div class="divider"></div>
          </div>

          <!-- Wallet Options -->
          <div class="wallet-options">
            <button
              *ngFor="let wallet of availableWallets"
              class="wallet-option"
              [class.active]="wallet.isActive"
              (click)="connect(wallet.id)"
            >
              <img
                *ngIf="wallet.icon"
                [src]="wallet.icon"
                [alt]="wallet.name + ' icon'"
                class="wallet-icon-img"
              />
              <div *ngIf="!wallet.icon" class="wallet-icon-placeholder">{{getWalletEmoji(wallet.id)}}</div>
              <div class="wallet-name">{{wallet.name}}</div>
              <svg *ngIf="wallet.isActive" class="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 10l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button class="btn-close" (click)="closeModal()">Close</button>
            <button
              *ngIf="walletInfo.connected"
              class="btn-logout"
              (click)="disconnect()"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wallet-connect {
      display: flex;
      align-items: center;
    }

    .wallet-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }

    .wallet-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .connected-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .wallet-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .network-badge {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .address {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.875rem;
    }

    .balance {
      font-size: 0.875rem;
      color: #718096;
      font-weight: 500;
    }

    .disconnect-button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #e53e3e;
      background: transparent;
      border: 1px solid #e53e3e;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .disconnect-button:hover {
      background: #e53e3e;
      color: white;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      max-width: 450px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 2rem;
      color: #718096;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: #2d3748;
    }

    .account-section {
      margin-bottom: 1.5rem;
    }

    .account-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
      border-radius: 12px;
      color: white;
    }

    .account-address {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .account-balance {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .account-network {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .divider {
      height: 1px;
      background: #e2e8f0;
      margin-top: 1.5rem;
    }

    .wallet-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .wallet-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .wallet-option:hover {
      border-color: #667eea;
      background: white;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .wallet-option.active {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .wallet-icon-img {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;
      border-radius: 8px;
    }

    .wallet-icon-placeholder {
      font-size: 2rem;
      width: 2.5rem;
      text-align: center;
    }

    .wallet-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 1.125rem;
      flex: 1;
    }

    .check-icon {
      flex-shrink: 0;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .btn-close, .btn-logout {
      flex: 1;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-size: 1rem;
    }

    .btn-close {
      background: #e2e8f0;
      color: #2d3748;
    }

    .btn-close:hover {
      background: #cbd5e0;
    }

    .btn-logout {
      background: #dc2626;
      color: white;
    }

    .btn-logout:hover {
      background: #b91c1c;
    }
  `]
})
export class WalletConnectComponent implements OnInit, OnDestroy {
  walletInfo: WalletInfo = {
    address: null,
    balance: 0,
    connected: false
  };
  availableWallets: WalletData[] = [];
  showWalletModal = false;
  private subscriptions: Subscription[] = [];

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    // Subscribe to wallet info
    this.subscriptions.push(
      this.walletService.getWalletInfo().subscribe((info) => {
        this.walletInfo = info;
      })
    );

    // Subscribe to available wallets
    this.subscriptions.push(
      this.walletService.getWallets().subscribe((wallets) => {
        this.availableWallets = wallets;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async connect(walletId: string): Promise<void> {
    if (!walletId) return;

    try {
      await this.walletService.connect(walletId);
      // Don't close modal immediately - let user see the connection succeeded
      setTimeout(() => {
        this.showWalletModal = false;
      }, 500);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      const errorMsg = error?.message || 'Failed to connect wallet';
      alert(`Connection failed: ${errorMsg}\n\nPlease make sure your wallet is installed and unlocked.`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.walletService.disconnect();
      this.showWalletModal = false;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  closeModal(): void {
    this.showWalletModal = false;
  }

  formatAddress(address: string): string {
    return this.walletService.formatAddress(address);
  }

  getWalletEmoji(walletId: string): string {
    const emojiMap: Record<string, string> = {
      'pera': '🔷',
      'defly': '🦋',
      'exodus': '⚡',
      'walletconnect': '🔗'
    };
    return emojiMap[walletId.toLowerCase()] || '👛';
  }
}
