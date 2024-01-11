import {
  apiNodeAtom,
  isNodeSelectorOpenAtom,
  networkConfigPAtom,
  rpcNodeAtom,
  savedApiNodeAtom,
  savedRpcNodeAtom,
} from 'store/app';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import ActionsDialog from './ActionsDialog';
import Combobox from './Combobox';
import { useEffect, useState } from 'react';
import { loadable } from 'jotai/utils';

const useRpcAddrs = () => {
  const [rpcAddrs, setRpcAddrs] = useState<string[]>([]);
  const [apiAddrs, setApiAddrs] = useState<string[]>([]);
  const networkConfig = useAtomValue(loadable(networkConfigPAtom));

  useEffect(() => {
    if (networkConfig.state === 'hasData') {
      const { rpcAddrs, apiAddrs } = networkConfig.data;
      setRpcAddrs(rpcAddrs);
      setApiAddrs(apiAddrs);
    }
  }, [networkConfig]);

  return { rpcAddrs, apiAddrs };
};

const NodeSelectorDialog = () => {
  const [isOpen, setIsOpen] = useAtom(isNodeSelectorOpenAtom);
  const { rpcAddrs, apiAddrs } = useRpcAddrs();
  const currentActiveApi = useAtomValue(apiNodeAtom);
  const currentActiveRpc = useAtomValue(rpcNodeAtom);
  const [selectedApi, setSelectedApi] = useState(currentActiveApi);
  const [selectedRpc, setSelectedRpc] = useState(currentActiveRpc);
  const [initialApi, setInitialApi] = useState(currentActiveApi);
  const [initialRpc, setInitialRpc] = useState(currentActiveRpc);
  const setSavedRpc = useSetAtom(savedRpcNodeAtom);
  const setSavedApi = useSetAtom(savedApiNodeAtom);

  const save = () => {
    assert(selectedApi && selectedRpc);
    setSavedApi(selectedApi);
    setSavedRpc(selectedRpc);
    setIsOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedRpc(currentActiveRpc);
      setSelectedApi(currentActiveApi);
      setInitialRpc(currentActiveRpc);
      setInitialApi(currentActiveApi);
    }
  }, [isOpen, currentActiveRpc, currentActiveApi]);

  const body = (
    <div className="mt-2 p-1 max-h-96">
      <p>RPC Endpoint:</p>
      <Combobox
        onValueChange={(value: string) => {
          setSelectedRpc(value);
        }}
        value={selectedRpc}
        options={rpcAddrs}
      />
      <p className="mt-4">API Endpoint:</p>
      <Combobox
        onValueChange={(value: string) => {
          setSelectedApi(value);
        }}
        value={selectedApi}
        options={apiAddrs}
      />
    </div>
  );

  return (
    <ActionsDialog
      title="Connection Settings"
      body={body}
      isOpen={isOpen}
      primaryAction={{
        action: save,
        label: 'Save',
      }}
      secondaryAction={{
        action: () => {
          setIsOpen(false);
        },
        label: 'Cancel',
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      initialFocusPrimary
      overflow
      primaryActionDisabled={
        !(selectedApi && selectedRpc) ||
        (initialApi === selectedApi && initialRpc === selectedRpc)
      }
    />
  );
};

export default NodeSelectorDialog;
