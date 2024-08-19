import React, { createContext, useContext, useMemo, useState } from 'react';

export interface IContext {
  isGiftClaimed: boolean;
  setIsGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalContext = createContext<IContext>({
  isGiftClaimed: false,
  setIsGiftClaimed: () => {},
});

// TODO: Get rid of GlobalContext
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGiftClaimed, setIsGiftClaimed] = useState(false);

  const value = useMemo(() => {
    return {
      isGiftClaimed,
      setIsGiftClaimed,
    };
  }, [isGiftClaimed]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
