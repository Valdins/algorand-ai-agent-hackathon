/**
 * Development environment configuration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',

  // Algorand LocalNet Configuration
  algod: {
    server: 'http://localhost',
    port: 4001,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    network: 'localnet'
  },

  // Payment Configuration
  payment: {
    receiverAddress: '', // Will be fetched from backend
    deploymentCost: 0.5
  }
};
