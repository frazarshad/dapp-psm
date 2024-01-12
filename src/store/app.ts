import type { PursesJSONState } from '@agoric/wallet-backend';
import { networkConfigs } from 'config';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { makeDisplayFunctions } from 'utils/displayFunctions';
import { mapAtom } from 'utils/helpers';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio';
import { makeAgoricWalletConnection } from '@agoric/web-components';
import type { Brand, DisplayInfo, Amount } from '@agoric/ertp/src/types';
import { ChainStorageWatcher } from '@agoric/rpc';
import { loadNetworkConfig } from 'utils/networkConfig';

type Ratio = ReturnType<typeof makeRatio>;

export type ChainConnection = Awaited<
  ReturnType<typeof makeAgoricWalletConnection>
> & { watcher: ChainStorageWatcher; chainId: string };

export type BrandInfo = DisplayInfo<'nat'> & {
  petname: string;
};

export const brandToInfoAtom = mapAtom<Brand, BrandInfo>();

export const chainConnectionAtom = atom<ChainConnection | null>(null);

export const offersAtom = atom<Array<any> | null>(null);

export const pursesAtom = atom<Array<PursesJSONState> | null>(null);

export const networkConfigAtom = atomWithStorage(
  'agoric-network-config',
  networkConfigs.mainnet
);

export const networkConfigPAtom = atom(async get =>
  loadNetworkConfig(get(networkConfigAtom).url)
);

export const termsIndexAgreedUponAtom = atomWithStorage('terms-agreed', -1);

/** A map of anchor brand petnames to their instance ids. */
export const instanceIdsAtom = mapAtom<string, string>();

export type Metrics = {
  anchorPoolBalance: Amount;
  feePoolBalance: Amount;
  totalAnchorProvided: Amount;
  totalMintedProvided: Amount;
  mintedPoolBalance: Amount;
};

/** A map of anchor brand petnames to their instances' metrics. */
export const metricsIndexAtom = mapAtom<string, Metrics>();

export type GovernedParams = {
  giveMintedFee: Ratio;
  mintLimit: Amount;
  wantMintedFee: Ratio;
};

/** A map of anchor brand petnames to their instancess' governed params. */
export const governedParamsIndexAtom = mapAtom<string, GovernedParams>();

export const displayFunctionsAtom = atom(get => {
  const brandToInfo = get(brandToInfoAtom);
  return makeDisplayFunctions(brandToInfo);
});

/**  Experimental feature flag. */
export const previewEnabledAtom = atom(_get => false);

export const smartWalletProvisionedAtom = atom<boolean | undefined>(undefined);

export const chainConnectionErrorInternalAtom = atom<Error | null>(null);

export const chainConnectionErrorAtom = atom(
  get => get(chainConnectionErrorInternalAtom),
  (get, set, error: Error) => {
    if (get(chainConnectionErrorInternalAtom) === null) {
      set(chainConnectionErrorInternalAtom, error);
    }
  }
);

// Currently used rpc node.
export const rpcNodeAtom = atom<string | undefined>(undefined);

export const apiNodeAtom = atom<string | undefined>(undefined);

export const isNodeSelectorOpenAtom = atom<boolean>(false);

// If the user selected a node in the node selector, we save that choice here.
export const savedRpcNodeAtom = atomWithStorage<string | undefined>(
  'savedRpcNode',
  undefined
);

export const savedApiNodeAtom = atomWithStorage<string | undefined>(
  'savedApiNode',
  undefined
);
