/* eslint-disable react/no-unknown-property */
import { AppProps } from 'next/app';
import { NextPage } from 'next';
import Head from 'next/head';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { NextUIProvider } from '@nextui-org/react';
import { Manrope } from 'next/font/google';

import { TelegramProvider } from '@common/providers/telegramProvider';
import { GlobalStateProvider } from '@/common/providers/contextProvider';
import Error from '@/components/Error/Error';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [render, setRender] = useState(false);
  useEffect(() => {
    cryptoWaitReady().then(() => setRender(true));
  }, []);
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <main className={`${manrope.variable} font-sans`}>
      <style jsx global>{`
        :root {
          --font-manrope: ${manrope.style.fontFamily};
        }
      `}</style>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"></meta>
      </Head>
      <NextUIProvider>
        <ErrorBoundary fallback={<Error />}>
          <GlobalStateProvider>
            {render && (
              <TelegramProvider>
                <Router>{getLayout(<Component {...pageProps} />)} </Router>
              </TelegramProvider>
            )}
          </GlobalStateProvider>
        </ErrorBoundary>
      </NextUIProvider>
    </main>
  );
};
export default App;
