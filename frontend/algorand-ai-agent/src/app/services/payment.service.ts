import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import algosdk from 'algosdk';
import { WalletService } from './wallet.service';
import { environment } from '../../environments/environment';

export interface PaymentVerification {
  verified: boolean;
  amount: number;
  message?: string;
}

export interface PaymentConfig {
  receiver_address: string;
  deployment_cost: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private receiverAddress: string = environment.payment.receiverAddress;
  private deploymentCost: number = environment.payment.deploymentCost;

  constructor(
    private http: HttpClient,
    private walletService: WalletService
  ) {
    // Fetch payment config from backend on initialization
    this.loadPaymentConfig();
  }

  private async loadPaymentConfig(): Promise<void> {
    try {
      const config = await this.getPaymentConfig();
      this.receiverAddress = config.receiver_address;
      this.deploymentCost = config.deployment_cost;
    } catch (error) {
      console.warn('Failed to load payment config from backend, using defaults:', error);
    }
  }

  async sendPayment(receiverAddress: string, amount: number): Promise<string> {
    const walletInfo = this.walletService.getCurrentWalletInfo();
    const transactionSigner = this.walletService.getTransactionSigner();
    const algodClient = this.walletService.getAlgodClient();

    if (!walletInfo.connected || !walletInfo.address) {
      throw new Error('Wallet not connected');
    }

    // Check balance
    if (walletInfo.balance < amount) {
      throw new Error(`Insufficient balance. Required: ${amount} ALGO, Available: ${walletInfo.balance} ALGO`);
    }

    try {
      // Get suggested params
      const suggestedParams = await algodClient.getTransactionParams().do();

      // Create payment transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: walletInfo.address,
        to: receiverAddress,
        amount: Math.floor(amount * 1_000_000), // Convert ALGO to microAlgos
        suggestedParams,
        note: new Uint8Array(Buffer.from('Smart Contract Deployment Payment'))
      });

      // Encode transaction for signing
      //const encodedTxn = algosdk.encodeUnsignedTransaction(txn);

      // Sign transaction with connected wallet
      const signedTxns = await transactionSigner([txn], [0]);

      // Send transaction
      if (!signedTxns || signedTxns.length === 0 || !signedTxns[0]) {
        throw new Error('Transaction signing was cancelled or failed');
      }

      const { txId } = await algodClient.sendRawTransaction(signedTxns[0]).do();

      // Wait for confirmation (4 rounds)
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      // Refresh balance after successful payment
      await this.walletService.refreshBalance();

      return txId;
    } catch (error: any) {
      console.error('Payment failed:', error);

      // Provide user-friendly error messages
      if (error.message?.includes('cancelled')) {
        throw new Error('Transaction was cancelled by user');
      } else if (error.message?.includes('rejected')) {
        throw new Error('Transaction was rejected by wallet');
      } else if (error.message?.includes('insufficient')) {
        throw new Error('Insufficient balance for transaction');
      }

      throw error;
    }
  }

  verifyPayment(txnId: string, walletAddress: string): Observable<PaymentVerification> {
    return this.http.post<PaymentVerification>(
      `${environment.apiUrl}/api/verify-payment`,
      {
        transaction_id: txnId,
        wallet_address: walletAddress
      }
    );
  }

  async getPaymentConfig(): Promise<PaymentConfig> {
    return firstValueFrom(
      this.http.get<PaymentConfig>(`${environment.apiUrl}/api/payment-config`)
    );
  }

  getDeploymentCost(): number {
    return this.deploymentCost;
  }

  getReceiverAddress(): string {
    return this.receiverAddress;
  }

  async refreshPaymentConfig(): Promise<void> {
    await this.loadPaymentConfig();
  }
}
