import type { AssetAccount, AssetPrice } from '../types';

import React, { createContext, useContext, useState } from 'react';

export interface IContext {
  assets: AssetAccount[];
  isGiftClaimed: boolean;
  publicKey?: HexString;
  assetsPrices: AssetPrice | null;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  setAssetsPrices: React.Dispatch<React.SetStateAction<AssetPrice | null>>;
}

export const GlobalContext = createContext<IContext>({
  assets: [],
  isGiftClaimed: false,
  assetsPrices: null,
  setPublicKey: () => {},
  setAssets: () => {},
  setIsGiftClaimed: () => {},
  setAssetsPrices: () => {},
});

// TODO: Get rid of GlobalContext
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);
  const [assetsPrices, setAssetsPrices] = useState<AssetPrice | null>(null);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

  const value = {
    publicKey,
    assets,
    isGiftClaimed,
    assetsPrices,
    setPublicKey,
    setAssets,
    setIsGiftClaimed,
    setAssetsPrices,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
