import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet';
import algosdk from 'algosdk';
import { environment } from '../../environments/environment';

export interface WalletInfo {
  address: string | null;
  balance: number;
  connected: boolean;
}

export interface WalletData {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  accounts: Array<{ address: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletManager: WalletManager | null = null;
  private walletInfo$ = new BehaviorSubject<WalletInfo>({
    address: null,
    balance: 0,
    connected: false
  });
  private wallets$ = new BehaviorSubject<WalletData[]>([]);

  private algodClient: algosdk.Algodv2;

  constructor() {
    this.algodClient = this.initializeAlgodClient();
    this.initializeWalletManager();
  }

  private initializeAlgodClient(): algosdk.Algodv2 {
    const { server, port, token } = environment.algod;
    return new algosdk.Algodv2(token, server, port);
  }

  private initializeWalletManager(): void {
    try {
      const { server, port, token } = environment.algod;
      this.walletManager = new WalletManager({
        wallets: [
          { id: WalletId.DEFLY },
          { id: WalletId.PERA },
          { id: WalletId.EXODUS },
        ],
        network: NetworkId.LOCALNET,
        options: {
          resetNetwork: true,
        },
        algod: {
          baseServer: server,
          port: port,
          token: token
        }
      });

      // Subscribe to wallet state changes
      this.walletManager.subscribe((state) => {
        const activeAccount = state.wallets.walletconnect?.activeAccount;

        if (activeAccount) {
          // Update wallet info when connected
          this.updateWalletInfo(activeAccount.address);
        } else {
          // Reset wallet info when disconnected
          this.walletInfo$.next({
            address: null,
            balance: 0,
            connected: false
          });
        }

        // Update wallets list
        //this.updateWalletsList(state.wallets);
      });
    } catch (error) {
      console.error('Failed to initialize wallet manager:', error);
    }
  }

  private updateWalletsList(wallets: any[]): void {
    const walletData: WalletData[] = wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.metadata?.name || wallet.id,
      icon: wallet.metadata?.icon || '',
      isActive: wallet.isActive,
      accounts: wallet.accounts || []
    }));
    this.wallets$.next(walletData);
  }

  async connect(walletId: WalletId | string): Promise<void> {
    if (!this.walletManager) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      const wallet = this.walletManager.wallets?.find((w) => w.id === walletId);
      if (!wallet) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      await wallet.connect();
      const accounts = wallet.accounts;

      if (accounts && accounts.length > 0) {
        await this.setActiveAccount(accounts[0].address);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async setActiveAccount(address: string): Promise<void> {
    if (!this.walletManager) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      //await this.walletManager. = address;
      await this.updateWalletInfo(address);
    } catch (error) {
      console.error('Failed to set active account:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.walletManager?.activeWallet) {
      await this.walletManager.activeWallet.disconnect();
    } else {
      // Fallback: clear localStorage if no active wallet
      localStorage.removeItem('@txnlab/use-wallet');
    }
    this.walletInfo$.next({
      address: null,
      balance: 0,
      connected: false
    });
  }

  private async updateWalletInfo(address: string): Promise<void> {
    try {
      const balance = await this.getBalance(address);
      this.walletInfo$.next({
        address,
        balance,
        connected: true
      });
    } catch (error) {
      console.error('Failed to update wallet info:', error);
    }
  }

  private async getBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo["amount"] / 1_000_000; // Convert microAlgos to Algos
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  // Observables for components to subscribe to
  getWalletInfo(): Observable<WalletInfo> {
    return this.walletInfo$.asObservable();
  }

  getWallets(): Observable<WalletData[]> {
    return this.wallets$.asObservable();
  }

  // Synchronous getters
  getCurrentWalletInfo(): WalletInfo {
    return this.walletInfo$.value;
  }

  getCurrentWallets(): WalletData[] {
    return this.wallets$.value;
  }

  getWalletManager(): WalletManager | null {
    return this.walletManager;
  }

  getAlgodClient(): algosdk.Algodv2 {
    return this.algodClient;
  }

  // Get transaction signer for the active wallet
  getTransactionSigner() {
    if (!this.walletManager?.activeWallet) {
      throw new Error('No active wallet');
    }
    return this.walletManager.activeWallet.transactionSigner;
  }

  // Utility methods
  async refreshBalance(): Promise<void> {
    const currentInfo = this.walletInfo$.value;
    if (currentInfo.address) {
      await this.updateWalletInfo(currentInfo.address);
    }
  }

  formatAddress(address: string | null): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
