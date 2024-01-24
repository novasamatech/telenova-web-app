import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { WebApp, WebAppUser, MainButton, BackButton } from '@twa-dev/types';

export interface ITelegramContext {
  webApp?: WebApp;
  user?: WebAppUser;
  MainButton?: MainButton;
  BackButton?: BackButton;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: PropsWithChildren) => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    const app = (window as any).Telegram?.WebApp;
    if (app) {
      app.ready();
      setWebApp(app);
    }
  }, []);

  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          MainButton: webApp.MainButton,
          BackButton: webApp.BackButton,
          user: webApp.initDataUnsafe.user,
        }
      : {};
  }, [webApp]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};

export const useTelegram = () => useContext(TelegramContext);
