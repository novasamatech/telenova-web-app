import { AppProps } from 'next/app';
import { NextPage } from 'next';
import Head from 'next/head';
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"></meta>
      </Head>
      <NextUIProvider>
        <GlobalStateProvider>
          {render && (
            <TelegramProvider>
              <Router>{getLayout(<Component {...pageProps} />)} </Router>
            </TelegramProvider>
          )}
        </GlobalStateProvider>
      </NextUIProvider>
    </>
  );
};
export default App;
