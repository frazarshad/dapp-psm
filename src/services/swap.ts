import type { PursesJSONState } from '@agoric/wallet-backend';
import { SwapDirection } from 'store/swap';
import { AmountMath } from '@agoric/ertp';
import { toast } from 'react-toastify';
import type { ContractInvitationSpec } from '@agoric/smart-wallet/src/invitations';
import type { ChainConnection } from 'store/app';

type SwapContext = {
  instance: unknown;
  fromPurse: PursesJSONState;
  fromValue: bigint;
  toPurse: PursesJSONState;
  toValue: bigint;
  swapDirection: SwapDirection;
  chainConnection: ChainConnection;
};

export const makeSwapOffer = ({
  instance,
  fromPurse,
  fromValue,
  toPurse,
  toValue,
  swapDirection,
  chainConnection,
}: SwapContext) => {
  const publicInvitationMaker =
    swapDirection === SwapDirection.WantMinted
      ? 'makeWantMintedInvitation'
      : 'makeGiveMintedInvitation';

  const spec: ContractInvitationSpec = {
    source: 'contract',
    instance,
    publicInvitationMaker,
  };

  const [inAmount, outAmount] = [
    AmountMath.make(fromPurse.brand, fromValue),
    AmountMath.make(toPurse.brand, toValue),
  ];

  const proposal = {
    give: {
      In: inAmount,
    },
    want: {
      Out: outAmount,
    },
  };

  const toastId = toast.info('Submitting transaction...', {
    isLoading: true,
  });
  chainConnection.makeOffer(
    spec,
    proposal,
    undefined,
    ({ status, data }: { status: string; data: object }) => {
      if (status === 'error') {
        console.error('Offer error', data);
        toast.dismiss(toastId);
        toast.error(`Offer Failed: ${data}`);
      }
      if (status === 'refunded') {
        toast.dismiss(toastId);
        toast.error('Offer Refunded');
      }
      if (status === 'accepted') {
        toast.dismiss(toastId);
        toast.success('Swap Completed');
      }
    }
  );
};
