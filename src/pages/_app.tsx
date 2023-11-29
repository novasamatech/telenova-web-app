import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { TelegramProvider } from '@/common/providers/telegramProvider';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { BalanceProvider } from '@/common/balances/BalanceProvider';
import './globals.css';

function App({ Component, pageProps }: AppProps) {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);
  return render ? (
    <TelegramProvider>
      <NextUIProvider>
        <ChainRegistry>
          <ExtrinsicProvider>
            <BalanceProvider>
              <Component {...pageProps} />
            </BalanceProvider>
          </ExtrinsicProvider>
        </ChainRegistry>
      </NextUIProvider>
    </TelegramProvider>
  ) : null;
}
export default App;
