import { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';

import { TelegramProvider } from '@common/providers/telegramProvider';
import { GlobalStateProvider } from '@/common/providers/contextProvider';
import './globals.css';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <NextUIProvider>
      <GlobalStateProvider>
        {render && (
          <TelegramProvider>
            <Router>{getLayout(<Component {...pageProps} />)} </Router>
          </TelegramProvider>
        )}
      </GlobalStateProvider>
    </NextUIProvider>
  );
};
export default App;
