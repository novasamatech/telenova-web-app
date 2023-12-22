import { AppProps } from 'next/app';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TelegramProvider } from '@common/providers/telegramProvider';
import { GlobalStateProvider } from '@/common/providers/contextProvider';
import './globals.css';
import { NextPage } from 'next';

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
        {render && <TelegramProvider>{getLayout(<Component {...pageProps} />)} </TelegramProvider>}
      </GlobalStateProvider>
    </NextUIProvider>
  );
};
export default App;
