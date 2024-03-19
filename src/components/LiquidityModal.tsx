import { LiquidityModal, Tabs } from '@leapwallet/elements';
import { useAtomValue } from 'jotai';
import { chainConnectionAtom, displayFunctionsAtom } from 'store/app';
import { useElementsWalletClient } from 'utils/elementsWalletClient';
import WalletIcon from 'assets/svg/wallet';
import type { Brand } from '@agoric/ertp/src/types';
import { AssetSelector } from '@leapwallet/elements';

import '@leapwallet/elements/styles.css';

export enum Direction {
  deposit = 'DEPOSIT',
  withdraw = 'WITHDRAW',
}

type Props = {
  selectedAsset: Brand | null;
  direction: Direction;
};

const agoricChainId = 'agoric-3';

const chainIdForCollateralPetname = (petname?: string) => {
  switch (petname) {
    case 'IST':
      return agoricChainId;
    default:
      return undefined;
  }
};

const assetForCollateralPetname = (petname?: string) => {
  switch (petname) {
    case 'IST':
      return ['symbol', 'IST'] as AssetSelector;
    default:
      return undefined;
  }
};

const LeapLiquidityModal = ({ selectedAsset, direction }: Props) => {
  const chainConnection = useAtomValue(chainConnectionAtom);
  const elementsWalletClient = useElementsWalletClient();

  const { displayBrandPetname, displayBrandIcon } =
    useAtomValue(displayFunctionsAtom) ?? {};

  const collateralPetname =
    (selectedAsset ?? undefined) &&
    displayBrandPetname &&
    displayBrandPetname(selectedAsset);

  const buttonMsg = `${direction} ${collateralPetname ?? 'FUNDS'}`;

  const renderLiquidityButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        className="normal-case font-sans flex items-center gap-2 border-2 border-solid border-interGreen fill-interGreen text-interGreen rounded-md px-3 py-2 text-xs font-semibold bg-emerald-400 bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20 transition disabled:cursor-not-allowed"
        onClick={onClick}
      >
        <WalletIcon />
        {buttonMsg}
      </button>
    );
  };

  return (
    <LiquidityModal
      renderLiquidityButton={renderLiquidityButton}
      theme="light"
      walletClientConfig={{
        userAddress: chainConnection?.address,
        walletClient: elementsWalletClient,
        connectWallet: (chainId?: string) => {
          return elementsWalletClient.connect(chainId);
        },
      }}
      defaultActiveTab={collateralPetname === 'IST' ? Tabs.SWAP : Tabs.TRANSFER}
      config={{
        icon:
          (displayBrandIcon && displayBrandIcon(selectedAsset)) ?? './IST.png',
        title: buttonMsg,
        subtitle: '',
        tabsConfig: {
          [Tabs.BRIDGE_USDC]: {
            enabled: false,
          },
          [Tabs.FIAT_ON_RAMP]: {
            enabled: false,
          },
          [Tabs.CROSS_CHAIN_SWAPS]: {
            enabled: true,
            defaults: {
              destinationChainId:
                chainIdForCollateralPetname(collateralPetname),
              destinationAssetSelector:
                assetForCollateralPetname(collateralPetname),
            },
          },
          [Tabs.SWAP]: {
            enabled: true,
            defaults: {
              destinationChainId:
                direction === Direction.deposit
                  ? agoricChainId
                  : chainIdForCollateralPetname(collateralPetname),
              sourceAssetSelector: assetForCollateralPetname(collateralPetname),
              sourceChainId:
                direction === Direction.deposit
                  ? chainIdForCollateralPetname(collateralPetname)
                  : agoricChainId,
              destinationAssetSelector:
                assetForCollateralPetname(collateralPetname),
            },
          },
          [Tabs.TRANSFER]: {
            enabled: true,
            defaults: {
              destinationChainId:
                direction === Direction.deposit
                  ? agoricChainId
                  : chainIdForCollateralPetname(collateralPetname),
              sourceAssetSelector: assetForCollateralPetname(collateralPetname),
              sourceChainId:
                direction === Direction.deposit
                  ? chainIdForCollateralPetname(collateralPetname)
                  : agoricChainId,
            },
          },
        },
      }}
    />
  );
};

export default LeapLiquidityModal;
