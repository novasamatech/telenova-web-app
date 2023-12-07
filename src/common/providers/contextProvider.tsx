import React, { createContext, useContext, useState } from 'react';
import { HexString } from '../types';

export interface IContext {
  publicKey?: HexString;
  setPublicKey: React.Dispatch<React.SetStateAction<HexString | undefined>>;
}

export const GlobalContext = createContext<IContext>({ setPublicKey: () => {} });

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<HexString>();

  const value = { publicKey, setPublicKey };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
