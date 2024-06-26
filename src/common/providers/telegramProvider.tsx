import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { type BackButton, type WebApp, type WebAppUser } from '@twa-dev/types';

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
    const app = window.Telegram?.WebApp;
    if (app) {
      app.ready();
      setWebApp(app);
      app.setHeaderColor('#f2f2f7');
      app.expand();
      app.enableClosingConfirmation();
    }
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
