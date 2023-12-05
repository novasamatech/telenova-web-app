import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import type { WebAppUser, WebApp, MainButton } from '@common/telegram/types';

export interface ITelegramContext {
  webApp?: WebApp;
  user?: WebAppUser;
  MainButton?: MainButton;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
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
          user: webApp.initDataUnsafe.user,
        }
      : {};
  }, [webApp]);

  /* Make sure to include script tag with "beforeInteractive" strategy to pre-load web-app script */
  return (
    <TelegramContext.Provider value={value}>
      {/* eslint-disable-next-line */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);