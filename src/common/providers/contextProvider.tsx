import React, { createContext, useContext, useEffect, useState } from 'react';
import { AssetAccount, HexString } from '../types';
import { getWallet } from '../wallet';

export interface IContext {
  assets: AssetAccount[] | [];
  publicKey?: HexString;
  selectedAsset?: AssetAccount;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<AssetAccount | undefined>>;
}

export const GlobalContext = createContext<IContext>({
  assets: [],
  setPublicKey: () => {},
  setAssets: () => {},
  setSelectedAsset: () => {},
});

// TODO refactor this
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetAccount>();

  useEffect(() => {
    if (!publicKey) {
      const wallet = getWallet();
      setPublicKey(wallet?.publicKey);
    }
  }, []);

  const value = { publicKey, assets, selectedAsset, setPublicKey, setAssets, setSelectedAsset };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
