import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { dappConfig } from 'config';
import { PursesJSONState } from '@agoric/wallet-backend';
import {
  AgoricChainStoragePathKind,
  type ChainStorageWatcher,
} from '@agoric/rpc';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio';
import type {
  Metrics,
  GovernedParams,
  BrandInfo,
  ChainConnection,
} from 'store/app';
import type { Amount } from '@agoric/ertp/src/types';

type Ratio = ReturnType<typeof makeRatio>;

type GovernedParamsData = {
  current: {
    GiveMintedFee: { value: Ratio };
    MintLimit: { value: Amount<'nat'> };
    WantMintedFee: { value: Ratio };
  };
};

const watchGovernance = async (
  watcher: ChainStorageWatcher,
  setGovernedParamsIndex: ContractSetters['setGovernedParamsIndex'],
  anchorPetname: string
) => {
  // E.g. 'published.psm.IST.AUSD.governance'
  const spec = dappConfig.INSTANCE_PREFIX + anchorPetname + '.governance';

  watcher.watchLatest<GovernedParamsData>(
    [AgoricChainStoragePathKind.Data, spec],
    value => {
      const current = value.current;
      const giveMintedFee = current.GiveMintedFee.value;
      const mintLimit = current.MintLimit.value;
      const wantMintedFee = current.WantMintedFee.value;

      setGovernedParamsIndex([
        [anchorPetname, { giveMintedFee, mintLimit, wantMintedFee }],
      ]);
    }
  );
};

const watchMetrics = async (
  watcher: ChainStorageWatcher,
  setMetricsIndex: ContractSetters['setMetricsIndex'],
  anchorPetname: string
) => {
  // E.g. 'published.psm.IST.AUSD.metrics'
  const spec = dappConfig.INSTANCE_PREFIX + anchorPetname + '.metrics';

  watcher.watchLatest<Metrics>(
    [AgoricChainStoragePathKind.Data, spec],
    value => {
      console.debug('got metrics', value);
      setMetricsIndex([[anchorPetname, value]]);
    }
  );
};

const watchInstanceIds = async (
  watcher: ChainStorageWatcher,
  setters: ContractSetters
) => {
  const watchedAnchors = new Set();

  watcher.watchLatest(
    [AgoricChainStoragePathKind.Data, dappConfig.INSTANCES_KEY],
    value => {
      console.debug('Got instances', value);
      const INSTANCE_NAME_PREFIX = 'psm-IST-';
      // Remove "psm-IST-" prefix so they're like ["AUSD", "board012"]
      const PSMEntries = (value as [string, string][])
        .filter(entry => entry[0].startsWith(INSTANCE_NAME_PREFIX))
        .map(
          ([key, boardId]) =>
            [key.slice(INSTANCE_NAME_PREFIX.length), boardId] as [
              string,
              string
            ]
        );

      setters.setInstanceIds(PSMEntries);

      PSMEntries.forEach(([anchorPetname]) => {
        if (!watchedAnchors.has(anchorPetname)) {
          watchedAnchors.add(anchorPetname);

          watchMetrics(watcher, setters.setMetricsIndex, anchorPetname);

          watchGovernance(
            watcher,
            setters.setGovernedParamsIndex,
            anchorPetname
          );
        }
      });
    }
  );
};

declare type ContractSetters = {
  setInstanceIds: (ids: [string, string][]) => void;
  setMetricsIndex: (metrics: [string, Metrics][]) => void;
  setGovernedParamsIndex: (params: [string, GovernedParams][]) => void;
};

export const watchContract = async (
  watcher: ChainStorageWatcher,
  setters: ContractSetters
) => {
  watchInstanceIds(watcher, setters);
};

export const watchPurses = async (
  chainConnection: { pursesNotifier: any },
  setPurses: (purses: PursesJSONState[]) => void,
  mergeBrandToInfo: (entries: Iterable<Iterable<any>>) => void
) => {
  const n = chainConnection.pursesNotifier;
  for await (const purses of iterateNotifier(n)) {
    if (!purses?.length) {
      console.warn('no purses from notifier');
      continue;
    }
    setPurses(purses);

    for (const purse of purses as PursesJSONState[]) {
      const { brand, displayInfo, brandPetname: petname } = purse;
      const decimalPlaces = displayInfo && displayInfo.decimalPlaces;
      const assetKind = displayInfo && displayInfo.assetKind;
      const newInfo: BrandInfo = {
        petname,
        assetKind,
        decimalPlaces,
      };

      mergeBrandToInfo([[brand, newInfo]]);
    }
  }
};

export const watchSmartWalletProvision = async (
  chainConnection: ChainConnection,
  setSmartWalletProvisioned: (isProvisioned: boolean) => void
) => {
  const n = chainConnection.smartWalletStatusNotifier;
  for await (const status of iterateNotifier(n)) {
    console.log('Provision status', status);
    setSmartWalletProvisioned(status?.provisioned);
  }
};
