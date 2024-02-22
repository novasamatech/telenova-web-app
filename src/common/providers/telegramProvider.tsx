import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { WebApp, WebAppUser, BackButton } from '@twa-dev/types';

export interface ITelegramContext {
  webApp?: WebApp;
  user?: WebAppUser;
  BackButton?: BackButton;
  startParam?: string;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: PropsWithChildren) => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeTelegramWebApp = () => {
      const app = (window as any).Telegram?.WebApp;
      if (app && isMounted) {
        app.ready();
        setWebApp(app);
        app.setHeaderColor('#f2f2f7');
        app.expand();
      }
    };

    initializeTelegramWebApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => {
    return webApp
      ? {
          webApp,
          BackButton: webApp.BackButton,
          user: webApp.initDataUnsafe.user,
          startParam: webApp.initDataUnsafe.start_param,
        }
      : {};
  }, [webApp]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};

export const useTelegram = () => useContext(TelegramContext);
