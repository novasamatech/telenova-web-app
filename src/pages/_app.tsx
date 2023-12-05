import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TelegramProvider } from '@common/providers/telegramProvider';
import { ExtrinsicProvider } from '@common/extrinsicService/ExtrinsicProvider';
import './globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);

  return (
    <NextUIProvider>
      <ExtrinsicProvider>
        {render && (
          <TelegramProvider>
            <Component {...pageProps} />
          </TelegramProvider>
        )}
      </ExtrinsicProvider>
    </NextUIProvider>
  );
};
export default App;
