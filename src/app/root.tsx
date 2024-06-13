import { type FC, type PropsWithChildren, useEffect, useState } from 'react';

import { type LinksFunction, type MetaFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { BalanceProvider } from '@/common/balances';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService';
import { GlobalStateProvider } from '@/common/providers/contextProvider.tsx';
import { TelegramProvider } from '@/common/providers/telegramProvider.tsx';
import { ErrorScreen, LoadingScreen } from '@/components';

import stylesheet from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'shortcut icon', href: 'data:image/x-icon;,', type: 'image/x-icon' },
];

export const meta: MetaFunction = () => [
  { charSet: 'utf-8' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  },
];

export const ErrorBoundary: FC = () => <ErrorScreen />;

export const HydrationFallback: FC = () => <LoadingScreen />;

export const Layout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head>
      <Meta />
      <Links />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <script defer src="https://telegram.org/js/telegram-web-app.js" />
      <script defer src="https://widget.mercuryo.io/embed.2.0.js" />
      <Scripts />
    </body>
  </html>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    cryptoWaitReady().then(() => setLoading(false));
  }, []);

  return (
    <main className="font-manrope flex justify-center">
      <GlobalStateProvider>
        {loading ? (
          <LoadingScreen />
        ) : (
          <TelegramProvider>
            <ChainRegistry>
              <ExtrinsicProvider>
                <BalanceProvider>
                  <div className="min-h-screen p-4 w-full overflow-x-auto break-words">
                    <Outlet />
                  </div>
                </BalanceProvider>
              </ExtrinsicProvider>
            </ChainRegistry>
          </TelegramProvider>
        )}
      </GlobalStateProvider>
    </main>
  );
}
