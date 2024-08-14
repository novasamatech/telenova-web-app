import React, { createContext, useContext, useState } from 'react';

import { type AssetPrice } from '@/types/substrate';

export interface IContext {
  isGiftClaimed: boolean;
  assetsPrices: AssetPrice | null;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  setAssetsPrices: React.Dispatch<React.SetStateAction<AssetPrice | null>>;
}

export const GlobalContext = createContext<IContext>({
  isGiftClaimed: false,
  assetsPrices: null,
  setIsGiftClaimed: () => {},
  setAssetsPrices: () => {},
});

// TODO: Get rid of GlobalContext
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [assetsPrices, setAssetsPrices] = useState<AssetPrice | null>(null);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

  const value = {
    isGiftClaimed,
    assetsPrices,
    setIsGiftClaimed,
    setAssetsPrices,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
