/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import clsx from 'clsx';
import CustomInput from 'components/CustomInput';
import { displayFunctionsAtom, previewEnabledAtom } from 'store/app';
import { displayPetname } from 'utils/displayFunctions';
import {
  toAmountAtom,
  fromAmountAtom,
  fromPurseAtom,
  toPurseAtom,
  swapDirectionAtom,
  SwapDirection,
  assetSelectionDialogOpenAtom,
} from 'store/swap';
import { AmountMath } from '@agoric/ertp';

export enum SectionSwapType {
  FROM = 'FROM',
  TO = 'TO',
}

const SectionSwap = ({ type }: { type: SectionSwapType }) => {
  const { displayBrandIcon, displayBrandPetname } =
    useAtomValue(displayFunctionsAtom);
  const fromPurse = useAtomValue(fromPurseAtom);
  const toPurse = useAtomValue(toPurseAtom);
  const [toAmount, setToAmount] = useAtom(toAmountAtom);
  const [fromAmount, setFromAmount] = useAtom(fromAmountAtom);
  const setAssetSelectionDialogOpen = useSetAtom(assetSelectionDialogOpenAtom);
  const swapDirection = useAtomValue(swapDirectionAtom);
  const previewEnabled = useAtomValue(previewEnabledAtom);

  const isMinted =
    (swapDirection === SwapDirection.WantMinted &&
      type === SectionSwapType.TO) ||
    (swapDirection === SwapDirection.WantAnchor &&
      type === SectionSwapType.FROM);

  const value =
    type === SectionSwapType.TO ? toAmount?.value : fromAmount?.value;

  const purse = type === SectionSwapType.TO ? toPurse : fromPurse;
  const brand = purse?.brand;

  const handleValueChange = (value: bigint) => {
    switch (type) {
      case SectionSwapType.FROM:
        setFromAmount(AmountMath.make(brand, value));
        break;
      case SectionSwapType.TO:
        setToAmount(AmountMath.make(brand, value));
        break;
    }
  };

  return (
    <motion.div
      className="flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none"
      layout
    >
      <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
        Swap {type}
      </h3>
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8">
          <img
            className="w-8 h-8"
            alt="brand icon"
            src={displayBrandIcon(brand)}
          />
        </div>
        {purse ? (
          <div
            className={clsx(
              'flex flex-col w-28 p-1 rounded-sm',
              !isMinted && 'hover:bg-black cursor-pointer hover:bg-opacity-5'
            )}
            onClick={() => {
              !isMinted && setAssetSelectionDialogOpen(true);
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">
                {displayBrandPetname(brand)}
              </h2>
              {!isMinted && <FiChevronDown className="text-xl" />}
            </div>
            {previewEnabled && (
              <h3 className="text-xs text-gray-500 font-semibold">
                Purse: <span>{displayPetname(purse?.pursePetname ?? '')}</span>{' '}
              </h3>
            )}
          </div>
        ) : (
          <button
            className="btn-primary text-sm py-1 px-2 w-28"
            onClick={() => setAssetSelectionDialogOpen(true)}
          >
            Select asset
          </button>
        )}
        <CustomInput
          value={value}
          onChange={handleValueChange}
          brand={brand}
          purse={purse}
          showMaxButton={type === SectionSwapType.FROM && !isMinted}
        />
      </div>
    </motion.div>
  );
};

export default SectionSwap;
