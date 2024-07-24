import React, { createContext, useContext, useState } from 'react';

import { type AssetPrice } from '@/types/substrate';

export interface IContext {
  isGiftClaimed: boolean;
  publicKey?: HexString;
  assetsPrices: AssetPrice | null;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  setAssetsPrices: React.Dispatch<React.SetStateAction<AssetPrice | null>>;
}

export const GlobalContext = createContext<IContext>({
  isGiftClaimed: false,
  assetsPrices: null,
  setPublicKey: () => {},
  setIsGiftClaimed: () => {},
  setAssetsPrices: () => {},
});

// TODO: Get rid of GlobalContext
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assetsPrices, setAssetsPrices] = useState<AssetPrice | null>(null);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

  const value = {
    publicKey,
    isGiftClaimed,
    assetsPrices,
    setPublicKey,
    setIsGiftClaimed,
    setAssetsPrices,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
