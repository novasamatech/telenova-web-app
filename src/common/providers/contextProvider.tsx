import React, { createContext, useContext, useEffect, useState } from 'react';
import { AssetAccount, HexString, TrasferAsset } from '../types';
import { getWallet } from '../wallet';

export interface IContext {
  assets: AssetAccount[] | [];
  isGiftClaimed: boolean;
  publicKey?: HexString;
  selectedAsset?: Partial<TrasferAsset | null>;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<Partial<TrasferAsset | null>>>;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalContext = createContext<IContext>({
  assets: [],
  selectedAsset: null,
  isGiftClaimed: false,
  setPublicKey: () => {},
  setAssets: () => {},
  setSelectedAsset: () => {},
  setIsGiftClaimed: () => {},
});

// TODO refactor this
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Partial<TrasferAsset | null>>(null);
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
    setPublicKey,
    setAssets,
    setSelectedAsset,
    setIsGiftClaimed,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
