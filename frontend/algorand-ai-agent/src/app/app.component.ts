import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

// Services
import { TaskService } from './services/task.service';
import { ApiService } from './services/api.service';
import { WalletService } from './services/wallet.service';
import { PaymentService } from './services/payment.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterOutlet
  ],
  providers: [TaskService, ApiService, WalletService, PaymentService],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
}
