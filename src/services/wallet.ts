import { toast } from 'react-toastify';
import type { Id as ToastId } from 'react-toastify';
import type { ChainConnection } from 'store/app';

export const provisionSmartWallet = async (
  chainConnection: ChainConnection,
  setProvisionToastId: (id: ToastId | undefined) => void
) => {
  const toastId = toast.info('Provisioning smart wallet...', {
    isLoading: true,
  });
  setProvisionToastId(toastId);

  try {
    await chainConnection.provisionSmartWallet();
  } catch (e: any) {
    console.error('Provisioning error', e);
    toast.dismiss(toastId);
    setProvisionToastId(undefined);
    toast.error(`Error provisioning smart wallet: ${e.message}`);
  }
};
