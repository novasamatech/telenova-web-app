import { type PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type LinksFunction, type LoaderFunction, type MetaFunction, json } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from '@remix-run/react';
import { $path } from 'remix-routes';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { BalanceProvider } from '@/common/balances';
import { ChainRegistry } from '@/common/chainRegistry';
import { ExtrinsicProvider } from '@/common/extrinsicService';
import { networkModel } from '@/common/network/network-model.ts';
import { GlobalStateProvider, useGlobalContext } from '@/common/providers/contextProvider';
import { TelegramProvider } from '@/common/providers/telegramProvider';
import { getWallet } from '@/common/wallet';
import { ErrorScreen } from '@/components';

import stylesheet from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'shortcut icon', href: 'data:image/x-icon;,', type: 'image/x-icon' },
];

export const meta: MetaFunction = () => [
  { charSet: 'utf-8' },
  { title: 'Telenova' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  },
];

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof Error) {
    return <ErrorScreen error={error?.toString?.()} />;
  }

  return <ErrorScreen error={JSON.stringify(error, null, 2)} />;
};

export const Layout = ({ children }: PropsWithChildren) => (
  <html lang="en">
    <head>
      <Meta />
      <Links />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />

      <script defer src="https://telegram.org/js/telegram-web-app.js" />
      <script async src="https://widget.mercuryo.io/embed.2.0.js" />
    </head>
    <body>
      <DataContext>{children}</DataContext>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

const DataContext = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cryptoWaitReady().then(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

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

export const loader = (() => {
  return json({
    file: process.env.PUBLIC_CHAINS_FILE,
  });
}) satisfies LoaderFunction;

const App = () => {
  const { file } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const { setPublicKey } = useGlobalContext();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    networkModel.input.networkStarted(file);

    navigate($path('/onboarding'), { replace: true });
  }, []);

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
};

export default App;
