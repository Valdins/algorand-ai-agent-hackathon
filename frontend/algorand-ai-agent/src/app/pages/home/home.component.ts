import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features = [
    {
      icon: '🤖',
      title: 'AI-Powered Generation',
      description: 'Advanced AI understands your requirements and generates production-ready smart contracts'
    },
    {
      icon: '⚡',
      title: 'Instant Deployment',
      description: 'Deploy directly to Algorand LocalNet for immediate testing and validation'
    },
    {
      icon: '🔒',
      title: 'Secure & Tested',
      description: 'Automated testing ensures your contract works correctly before deployment'
    },
    {
      icon: '📊',
      title: 'Full Control',
      description: 'Review generated code, test outputs, and deployment details in real-time'
    }
  ];

  examples = [
    {
      title: 'Counter Contract',
      description: 'Simple counter with increment/decrement',
      prompt: 'Create a simple counter contract with increment and decrement methods',
      icon: '🔢'
    },
    {
      title: 'Voting System',
      description: 'On-chain voting with proposals',
      prompt: 'Create a voting contract where users can create proposals and vote on them',
      icon: '🗳️'
    },
    {
      title: 'Token Swap',
      description: 'Decentralized token exchange',
      prompt: 'Create a token swap contract that allows users to exchange two different tokens',
      icon: '🔄'
    },
    {
      title: 'Escrow Contract',
      description: 'Secure fund holding',
      prompt: 'Create an escrow contract that holds funds until both parties agree to release',
      icon: '🔐'
    }
  ];

  constructor(private router: Router) {}

  getStarted(): void {
    this.router.navigate(['/generate']);
  }

  tryExample(prompt: string): void {
    this.router.navigate(['/generate'], { queryParams: { prompt } });
  }
}
