import type { PursesJSONState } from '@agoric/wallet-backend';
import type { WalletBridge } from 'store/app';
import { E } from '@endo/eventual-send';
import { SwapDirection } from 'store/swap';
import { AmountMath } from '@agoric/ertp';

type SwapContext = {
  wallet: WalletBridge;
  instanceId: string;
  fromPurse: PursesJSONState;
  fromValue: bigint;
  toPurse: PursesJSONState;
  toValue: bigint;
  swapDirection: SwapDirection;
  marshal: any;
};

export const makeSwapOffer = async ({
  wallet,
  instanceId,
  fromPurse,
  fromValue,
  toPurse,
  toValue,
  swapDirection,
  marshal,
}: SwapContext) => {
  const method =
    swapDirection === SwapDirection.WantMinted
      ? 'makeWantMintedInvitation'
      : 'makeGiveMintedInvitation';

  const [serializedInstance, serializedIn, serializedOut] = await Promise.all([
    E(marshal).serialize(instanceId),
    E(marshal).serialize(AmountMath.make(fromPurse.brand, fromValue)),
    E(marshal).serialize(AmountMath.make(toPurse.brand, toValue)),
  ]);

  const offerConfig = {
    publicInvitationMaker: method,
    instanceHandle: serializedInstance,
    proposalTemplate: {
      give: {
        In: {
          amount: serializedIn,
        },
      },
      want: {
        Out: {
          amount: serializedOut,
        },
      },
    },
  };

  console.info('OFFER CONFIG: ', offerConfig);
  wallet.addOffer(offerConfig);
};
