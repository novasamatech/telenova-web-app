import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TelegramProvider } from '@common/providers/telegramProvider';
import { GlobalStateProvider } from '@/common/providers/contextProvider';
import './globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);

  return (
    <NextUIProvider>
      <GlobalStateProvider>
        {render && (
          <TelegramProvider>
            <Component {...pageProps} />
          </TelegramProvider>
        )}
      </GlobalStateProvider>
    </NextUIProvider>
  );
};
export default App;
