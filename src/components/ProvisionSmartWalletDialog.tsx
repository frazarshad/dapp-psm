import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment } from 'react';
import { chainConnectionAtom, provisionToastIdAtom } from 'store/app';
import { useAtomValue, useSetAtom } from 'jotai';
import { provisionSmartWallet } from 'services/wallet';

// Increment every time the current terms change.
export const currentTermsIndex = 1;

const feeDenom = 10n ** 6n;

const ProvisionSmartWalletDialog = ({
  isOpen,
  onClose,
  smartWalletFee,
}: {
  isOpen: boolean;
  onClose: () => void;
  smartWalletFee: bigint | null;
}) => {
  const chainConnection = useAtomValue(chainConnectionAtom);
  const setProvisionToastId = useSetAtom(provisionToastIdAtom);
  const smartWalletFeeForDisplay = smartWalletFee
    ? smartWalletFee / feeDenom + ' BLD'
    : null;

  const provision = () => {
    assert(chainConnection);
    provisionSmartWallet(chainConnection, setProvisionToastId);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Smart Wallet Required
                </Dialog.Title>
                <div className="mt-2 p-1 max-h-96 overflow-y-auto">
                  To interact with contracts on the Agoric chain, a smart wallet
                  must be created for your account. As an anti-spam measure, you
                  will need{' '}
                  {smartWalletFeeForDisplay && (
                    <b>{smartWalletFeeForDisplay}</b>
                  )}{' '}
                  to fund its provision which will be deposited to the community
                  fund.
                </div>
                <div className="mt-4 float-right">
                  <button
                    type="button"
                    className={clsx(
                      'inline-flex justify-center rounded-md border border-transparent',
                      'px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2',
                      'focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                      'bg-gray-100 text-gray-500 hover:bg-gray-200 mx-4'
                    )}
                    onClick={onClose}
                  >
                    Back to App
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      'inline-flex justify-center rounded-md border border-transparent',
                      'px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2',
                      'focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                      'bg-purple-100 text-purple-900 hover:bg-purple-200'
                    )}
                    onClick={provision}
                  >
                    Provision Now
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProvisionSmartWalletDialog;
