export const DEFAULT_TIMEOUT = 60_000;

export const phrasesList = {
  emerynet: {
    walletButton: 'li[data-value="testnet"]',
    psmNetwork: 'Agoric Emerynet',
    token: 'ToyUSD',
    isLocal: false,
    provisionFee: 0.75,
  },
  local: {
    walletButton: 'li[data-value="local"]',
    psmNetwork: 'Local Network',
    token: 'USDC_axl',
    isLocal: true,
    provisionFee: 0,
  },
};
