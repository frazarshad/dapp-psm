/// <reference types="vite/client" />

declare module '@agoric/notifier' {
  export const makeAsyncIterableFromNotifier;
}

declare module '@agoric/wallet-backend' {
  export type PursesJSONState = {
    brand: import('@agoric/ertp').Brand;
    /** The board ID for this purse's brand */
    brandBoardId: string;
    /** The board ID for the deposit-only facet of this purse */
    depositBoardId?: string;
    /** The petname for this purse's brand */
    brandPetname: Petname;
    /** The petname for this purse */
    pursePetname: Petname;
    /** The brand's displayInfo */
    displayInfo: any;
    /** The purse's current balance */
    value: any;
    currentAmountSlots: any;
    currentAmount: any;
  };
}

declare module '@agoric/ui-components' {
  export const parseAsValue;
  export const stringifyValue;
  export const stringifyRatioAsPercent;
  export const stringifyRatio;
}

declare module '@endo/lockdown' {
  export const lockdown;
}

declare module '@agoric/cosmic-proto/swingset/query.js' {
  export const QueryClientImpl;
  export const QueryParamsResponse;
}
