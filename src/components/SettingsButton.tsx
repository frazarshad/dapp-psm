import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { HiOutlineCog } from 'react-icons/hi';
import { isNodeSelectorOpenAtom } from 'store/app';

const SettingsButton = () => {
  const setIsNodeSelectorOpen = useSetAtom(isNodeSelectorOpenAtom);

  const onClick = useCallback(() => {
    setIsNodeSelectorOpen(true);
  }, [setIsNodeSelectorOpen]);

  return (
    <button
      aria-label="Settings"
      className="h-fit rounded-full bg-black bg-opacity-5 px-3 py-3 text-2xl font-medium text-primary hover:bg-opacity-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      onClick={onClick}
    >
      <HiOutlineCog />
    </button>
  );
};

export default SettingsButton;
