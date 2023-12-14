import React, { createContext, useContext, useState } from 'react';
import { AssetAccount, HexString } from '../types';

export interface IContext {
  publicKey?: HexString;
  assets: AssetAccount[] | [];
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
  setAssets: React.Dispatch<React.SetStateAction<AssetAccount[]>>;
}

export const GlobalContext = createContext<IContext>({
  assets: [],
  setPublicKey: () => {},
  setAssets: () => {},
});

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();
  const [assets, setAssets] = useState<AssetAccount[]>([]);

  const value = { publicKey, assets, setPublicKey, setAssets };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
