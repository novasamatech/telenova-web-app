// TelegramProvider
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import type { ITelegramUser, IWebApp } from '@common/telegram/types';

export interface ITelegramContext {
  webApp?: IWebApp;
  user?: ITelegramUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [webApp, setWebApp] = useState<IWebApp | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeTelegramWebApp = () => {
      const app = (window as any).Telegram?.WebApp;
      if (app && isMounted) {
        app.ready();
        setWebApp(app);
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
          unsafeData: webApp.initDataUnsafe,
          user: webApp.initDataUnsafe.user,
        }
      : {};
  }, [webApp]);

  /* Make sure to include script tag with "beforeInteractive" strategy to pre-load web-app script */
  return (
    <TelegramContext.Provider value={value}>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
