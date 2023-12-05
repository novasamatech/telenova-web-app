'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { WebAppUser, WebApp, MainButton } from '@common/telegram/types';
import { Wallet } from '../wallet';

export interface ITelegramContext {
  webApp?: WebApp;
  user?: WebAppUser;
  MainButton?: MainButton;
  wallet?: Wallet;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  // const [address, setAddress] = useState<string | null>();

  useEffect(() => {
    let isMounted = true;

    const initializeTelegramWebApp = async () => {
      const app = (window as any).Telegram?.WebApp;
      if (app && isMounted) {
        app.ready();
        setWebApp(app);
        // await getWallet();
      }
    };

    initializeTelegramWebApp();

    return () => {
      isMounted = false;
    };
  }, []);
  // const getWallet = async (): Wallet | null => {
  //   const publicKey = localStorage.getItem(PUBLIC_KEY_STORE);

  //   if (publicKey) {
  //     return { publicKey: unwrapHexString(publicKey) };
  //   } else {
  //     console.log('getWallet');
  //     await window.Telegram.WebApp.CloudStorage.getItem(
  //       PUBLIC_KEY_STORE,
  //       (_err: string | null, value: string | null) => {
  //         setAddress(value);
  //         return value;
  //       },
  //     );
  //   }
  // };
  // console.log(address);

  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          MainButton: webApp.MainButton,
          user: webApp.initDataUnsafe.user,
          // wallet: address,
        }
      : {};
  }, [webApp]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};

export const useTelegram = () => useContext(TelegramContext);
