type MinimalNetworkConfig = { rpcAddrs: string[]; chainName: string };

export const loadNetworkConfig = (url: string): Promise<MinimalNetworkConfig> =>
  fetch(url).then(res => res.json());
