import { type FC, type PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type LinksFunction, type MetaFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from '@remix-run/react';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { $path } from 'remix-routes';

import { BalanceProvider } from '@/common/balances';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService';
import { GlobalStateProvider, useGlobalContext } from '@/common/providers/contextProvider.tsx';
import { TelegramProvider } from '@/common/providers/telegramProvider.tsx';
import { getWallet } from '@/common/wallet';
import { ErrorScreen } from '@/components';

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

export const ErrorBoundary: FC = () => {
  const error = useRouteError();

  return <ErrorScreen error={error?.toString?.()} />;
};

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
      <DataContext>{children}</DataContext>
      <ScrollRestoration />
      <script defer src="https://telegram.org/js/telegram-web-app.js" />
      <script defer src="https://widget.mercuryo.io/embed.2.0.js" />
      <Scripts />
    </body>
  </html>
);

const DataContext: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    cryptoWaitReady().then(() => setLoading(false));
  }, []);

  if (loading) {
    return null;
  }

  return (
    <GlobalStateProvider>
      <TelegramProvider>
        <ChainRegistry>
          <ExtrinsicProvider>
            <BalanceProvider>{children}</BalanceProvider>
          </ExtrinsicProvider>
        </ChainRegistry>
      </TelegramProvider>
    </GlobalStateProvider>
  );
};

export default function App() {
  const [error, setError] = useState<string | null>(null);
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    getWallet()
      .then(wallet => {
        if (!wallet) {
          return navigate($path('/onboarding'), { replace: true });
        }
        setPublicKey(wallet?.publicKey);
        navigate($path('/dashboard'), { replace: true });
      })
      .catch(e => setError(e?.toString?.()));
  }, []);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <main className="font-manrope flex justify-center">
      <div className="min-h-screen p-4 w-full overflow-x-auto break-words">
        <Outlet />
      </div>
    </main>
  );
}
