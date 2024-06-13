import React, { createContext, useContext, useEffect, useState } from 'react';

import { type AssetAccount, type AssetPrice, type HexString, type TrasferAsset } from '../types';
import { getWallet } from '../wallet';

export interface IContext {
  assets: AssetAccount[] | [];
  isGiftClaimed: boolean;
  publicKey?: HexString;
  selectedAsset?: Partial<TrasferAsset | null>;
  assetsPrices: AssetPrice | null;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<Partial<TrasferAsset | null>>>;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  setAssetsPrices: React.Dispatch<React.SetStateAction<AssetPrice | null>>;
}

export const GlobalContext = createContext<IContext>({
  assets: [],
  selectedAsset: null,
  isGiftClaimed: false,
  assetsPrices: null,
  setPublicKey: () => {},
  setAssets: () => {},
  setSelectedAsset: () => {},
  setIsGiftClaimed: () => {},
  setAssetsPrices: () => {},
});

// TODO refactor this
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Partial<TrasferAsset | null>>(null);
  const [assetsPrices, setAssetsPrices] = useState<AssetPrice | null>(null);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      const wallet = getWallet();
      setPublicKey(wallet?.publicKey);
    }
  }, []);

  const value = {
    publicKey,
    assets,
    selectedAsset,
    isGiftClaimed,
    assetsPrices,
    setPublicKey,
    setAssets,
    setSelectedAsset,
    setIsGiftClaimed,
    setAssetsPrices,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
