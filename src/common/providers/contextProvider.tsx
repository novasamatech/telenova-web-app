import React, { createContext, useContext, useState } from 'react';

import { type AssetAccount, type AssetPrice, type HexString, type TransferAsset } from '../types';

export interface IContext {
  assets: AssetAccount[];
  isGiftClaimed: boolean;
  publicKey?: HexString;
  selectedAsset?: Partial<TransferAsset | null>;
  assetsPrices: AssetPrice | null;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<Partial<TransferAsset | null>>>;
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

// TODO: Get rid of GlobalContext
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Partial<TransferAsset | null>>(null);
  const [assetsPrices, setAssetsPrices] = useState<AssetPrice | null>(null);
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

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
