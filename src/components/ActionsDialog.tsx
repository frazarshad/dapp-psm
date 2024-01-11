import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment, ReactElement, useRef } from 'react';

type DialogAction = {
  label: string;
  action: () => void;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: ReactElement;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  primaryActionDisabled?: boolean;
  // Whether to initially focus the primary action.
  initialFocusPrimary?: boolean;
  overflow?: boolean;
};

const ActionsDialog = ({
  isOpen,
  onClose,
  title,
  body,
  primaryAction,
  secondaryAction,
  primaryActionDisabled = false,
  initialFocusPrimary = false,
  overflow = false,
}: Props) => {
  const primaryButtonRef = useRef(null);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={initialFocusPrimary ? primaryButtonRef : undefined}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center cursor-pointer">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'cursor-default w-full max-w-2xl pt-6 px-2 transform bg-white text-left align-middle shadow-xl transition-all rounded-2xl',
                  overflow ? 'overflow-visible' : 'overflow-hidden'
                )}
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mx-8"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-4 mx-8">{body}</div>
                <div className="py-6 px-8">
                  <div className="flex justify-end gap-1">
                    {secondaryAction && (
                      <button
                        className={clsx(
                          'inline-flex justify-center rounded-md border border-transparent',
                          'px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2',
                          'focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                          'bg-gray-100 text-gray-500 hover:bg-gray-200 mx-4'
                        )}
                        onClick={secondaryAction.action}
                      >
                        {secondaryAction.label}
                      </button>
                    )}
                    {primaryAction && (
                      <button
                        ref={primaryButtonRef}
                        disabled={primaryActionDisabled}
                        className={clsx(
                          'inline-flex justify-center rounded-md border border-transparent',
                          'px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2',
                          'focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                          primaryActionDisabled
                            ? 'bg-gray-100 text-gray-300'
                            : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                        )}
                        onClick={primaryAction.action}
                      >
                        {primaryAction.label}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ActionsDialog;
