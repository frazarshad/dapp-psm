import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import {
  makeAgoricWalletConnection,
  AgoricKeplrConnectionErrors as Errors,
} from '@agoric/web-components';
import {
  brandToInfoAtom,
  pursesAtom,
  offersAtom,
  instanceIdsAtom,
  governedParamsIndexAtom,
  metricsIndexAtom,
  chainConnectionAtom,
  termsIndexAgreedUponAtom,
  smartWalletProvisionedAtom,
  provisionToastIdAtom,
  networkConfigPAtom,
  rpcNodeAtom,
  apiNodeAtom,
  chainConnectionErrorAtom,
  savedApiNodeAtom,
  savedRpcNodeAtom,
} from 'store/app';
import {
  watchContract,
  watchPurses,
  watchSmartWalletProvision,
} from 'utils/updates';
import NetworkDropdown from 'components/NetworkDropdown';
import TermsDialog, { currentTermsIndex } from './TermsDialog';
import clsx from 'clsx';
import { makeAgoricChainStorageWatcher } from '@agoric/rpc';
import { sample } from 'lodash-es';
import ProvisionSmartWalletDialog from './ProvisionSmartWalletDialog';
import { querySwingsetParams } from 'utils/swingsetParams';
import { loadable } from 'jotai/utils';

import 'react-toastify/dist/ReactToastify.css';
import 'styles/globals.css';
import SettingsButton from './SettingsButton';

const autoCloseDelayMs = 7000;

const useSmartWalletFeeQuery = () => {
  const [smartWalletFee, setFee] = useState<bigint | null>(null);
  const [error, setError] = useState<unknown | null>(null);
  const networkConfig = useAtomValue(loadable(networkConfigPAtom));

  useEffect(() => {
    if (networkConfig.state === 'loading') {
      return;
    }
    if (networkConfig.state === 'hasError') {
      setError(networkConfig.error);
    }
    const fetchParams = async (rpc: string) => {
      try {
        const params = await querySwingsetParams(rpc);
        console.debug('swingset params', params);
        setFee(BigInt(params.params.powerFlagFees[0].fee[0].amount));
      } catch (e: any) {
        setError(e);
      }
    };

    if (networkConfig.state === 'hasData') {
      const rpc = sample(networkConfig.data.rpcAddrs);
      if (!rpc) {
        setError('No RPC available in network config');
      } else {
        fetchParams(rpc);
      }
    }
  }, [networkConfig]);

  return { smartWalletFee, error };
};

const ChainConnection = () => {
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [chainConnection, setChainConnection] = useAtom(chainConnectionAtom);
  const mergeBrandToInfo = useSetAtom(brandToInfoAtom);
  const setPurses = useSetAtom(pursesAtom);
  const setOffers = useSetAtom(offersAtom);
  const setMetricsIndex = useSetAtom(metricsIndexAtom);
  const setGovernedParamsIndex = useSetAtom(governedParamsIndexAtom);
  const setInstanceIds = useSetAtom(instanceIdsAtom);
  const [provisionToastId, setProvisionToastId] = useAtom(provisionToastIdAtom);
  const smartWalletProvisionRequired = useRef(false);
  const [isSmartWalletProvisioned, setSmartWalletProvisioned] = useAtom(
    smartWalletProvisionedAtom
  );
  const termsAgreed = useAtomValue(termsIndexAgreedUponAtom);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isProvisionDialogOpen, setIsProvisionDialogOpen] = useState(false);
  const { smartWalletFee, error: smartWalletFeeError } =
    useSmartWalletFeeQuery();
  const networkConfig = useAtomValue(loadable(networkConfigPAtom));
  const setRpcNode = useSetAtom(rpcNodeAtom);
  const setApiNode = useSetAtom(apiNodeAtom);
  const setChainConnectionError = useSetAtom(chainConnectionErrorAtom);
  const savedApi = useAtomValue(savedApiNodeAtom);
  const savedRpc = useAtomValue(savedRpcNodeAtom);

  const areLatestTermsAgreed = termsAgreed === currentTermsIndex;

  const handleTermsDialogClose = () => {
    setIsTermsDialogOpen(false);
    connect(false);
  };

  useEffect(() => {
    if (
      isSmartWalletProvisioned === false &&
      !smartWalletProvisionRequired.current
    ) {
      if (smartWalletFeeError) {
        console.error('Swingset params error', smartWalletFeeError);
        toast.error('Error reading smart wallet provisioning fee from chain.');
        return;
      } else if (smartWalletFee) {
        smartWalletProvisionRequired.current = true;
        setIsProvisionDialogOpen(true);
      }
    } else if (
      isSmartWalletProvisioned &&
      smartWalletProvisionRequired.current
    ) {
      smartWalletProvisionRequired.current = false;
      if (provisionToastId) {
        toast.dismiss(provisionToastId);
        setProvisionToastId(undefined);
      }
      toast.success('Smart wallet successfully provisioned.');
    }
  }, [
    isSmartWalletProvisioned,
    provisionToastId,
    setProvisionToastId,
    smartWalletFeeError,
    smartWalletFee,
  ]);

  useEffect(() => {
    if (!chainConnection) return;

    watchSmartWalletProvision(chainConnection, setSmartWalletProvisioned).catch(
      (err: Error) =>
        console.error('Error watching smart wallet provision status', err)
    );

    watchPurses(chainConnection, setPurses, mergeBrandToInfo).catch(
      (err: Error) => console.error('got watchPurses err', err)
    );

    watchContract(chainConnection.watcher, {
      setMetricsIndex,
      setGovernedParamsIndex,
      setInstanceIds,
    });
  }, [
    chainConnection,
    mergeBrandToInfo,
    setPurses,
    setOffers,
    setMetricsIndex,
    setGovernedParamsIndex,
    setInstanceIds,
    setSmartWalletProvisioned,
  ]);

  const connect = async (checkTerms = true) => {
    if (connectionInProgress || chainConnection) return;

    if (checkTerms && !areLatestTermsAgreed) {
      setIsTermsDialogOpen(true);
      return;
    }
    setConnectionInProgress(true);
  };

  useEffect(() => {
    const connect = async () => {
      if (networkConfig.state === 'loading') {
        return;
      }
      try {
        if (networkConfig.state === 'hasError') {
          throw new Error(Errors.networkConfig);
        }

        const config = networkConfig.data;
        const rpc = savedRpc || sample(config.rpcAddrs);
        const api = savedApi || sample(config.apiAddrs);
        const chainId = config.chainName;

        if (!rpc || !api || !chainId) {
          throw new Error(Errors.networkConfig);
        }
        setRpcNode(rpc);
        setApiNode(api);
        const watcher = makeAgoricChainStorageWatcher(api, chainId, e => {
          console.error(e);
          setChainConnectionError(e);
        });
        const connection = await makeAgoricWalletConnection(watcher, rpc);
        setChainConnection({
          ...connection,
          watcher,
          chainId,
        });
      } catch (e: any) {
        switch (e.message) {
          case Errors.enableKeplr:
            toast.error('Enable the connection in Keplr to continue.', {
              hideProgressBar: false,
              autoClose: autoCloseDelayMs,
            });
            break;
          case Errors.networkConfig:
            toast.error('Network not found.');
            break;
          default:
            setChainConnectionError(e);
            break;
        }
      } finally {
        setConnectionInProgress(false);
      }
    };

    if (connectionInProgress) {
      connect();
    }
  }, [
    connectionInProgress,
    networkConfig,
    savedApi,
    savedRpc,
    setApiNode,
    setChainConnection,
    setChainConnectionError,
    setRpcNode,
  ]);

  const status = (() => {
    if (connectionInProgress) {
      return 'Connecting';
    } else if (chainConnection) {
      return 'Keplr Connected';
    }
    return 'Connect Keplr';
  })();

  return (
    <div className="flex flex-row space-x-2">
      <SettingsButton />
      <div className="flex flex-row align-middle">
        <NetworkDropdown />
      </div>
      <button
        className={clsx(
          'border border-primary group inline-flex items-center rounded-md px-3 py-2 bg-transparent text-base font-medium text-primary',
          !connectionInProgress && !chainConnection && 'hover:bg-gray-100'
        )}
        onClick={() => connect()}
      >
        {status}
        {connectionInProgress && (
          <div className="ml-1">
            <Oval color="#c084fc" height={18} width={18} />
          </div>
        )}
      </button>
      <TermsDialog
        isOpen={isTermsDialogOpen}
        onClose={handleTermsDialogClose}
      />
      <ProvisionSmartWalletDialog
        isOpen={isProvisionDialogOpen}
        onClose={() => setIsProvisionDialogOpen(false)}
        smartWalletFee={smartWalletFee}
      />
    </div>
  );
};

export default ChainConnection;
