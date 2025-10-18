import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WalletConnectComponent } from '../wallet-connect/wallet-connect.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, WalletConnectComponent],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="branding" (click)="goHome()" style="cursor: pointer;">
          <div class="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
              <path d="M20 10L28 16V24L20 30L12 24V16L20 10Z" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stop-color="#667eea"/>
                  <stop offset="100%" stop-color="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="title-section">
            <h1 class="title">Algorand AI Agent</h1>
            <p class="subtitle">Generate smart contracts with natural language</p>
          </div>
        </div>
        <app-wallet-connect></app-wallet-connect>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .branding {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      flex-shrink: 0;
    }

    .title-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.95rem;
      opacity: 0.9;
      margin: 0;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 0.875rem;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #48bb78;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 1.5rem 1rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.85rem;
      }

      .status {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}
