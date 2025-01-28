import { type PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type LinksFunction, type LoaderFunction, type MetaFunction, json } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from '@remix-run/react';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { GlobalStateProvider } from '@/common/providers/contextProvider';
import { navigationModel } from '@/models/navigation';
import { networkModel } from '@/models/network';
import { walletModel } from '@/models/wallet';
import { TelegramApi } from '@/shared/api';
import { ErrorScreen, LoadingScreen } from '@/ui/molecules';
import '@/models/balances';
import '@/models/prices';

import stylesheet from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'shortcut icon', href: 'data:image/x-icon;,', type: 'image/x-icon' },

  { rel: 'preconnect', href: 'https://telegram.org/js/telegram-web-app.js' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap' },

  { rel: 'prefetch', href: 'https://widget.mercuryo.io/embed.2.1.js', as: 'script' },
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
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <script src="https://telegram.org/js/telegram-web-app.js" />
      <Scripts />
    </body>
  </html>
);

export const loader = (() => {
  return json({
    file: process.env.PUBLIC_CHAINS_FILE,
  });
}) satisfies LoaderFunction;

const App = () => {
  const { file } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const [telegramError, setTelegramError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      TelegramApi.init();
    } catch (error) {
      setTelegramError(error as Error);
    }
  }, []);

  useEffect(() => {
    networkModel.input.networkStarted(file);

    cryptoWaitReady()
      .then(() => walletModel.input.walletRequested())
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    navigationModel.input.navigatorChanged(navigate);
  }, [navigate]);

  if (isLoading) return <LoadingScreen />;

  if (telegramError) return <ErrorScreen error={telegramError.message} />;

  return (
    <GlobalStateProvider>
      <main className="flex justify-center font-manrope">
        <div className="min-h-screen w-full overflow-x-auto break-words p-4">
          <Outlet />
        </div>
      </main>
    </GlobalStateProvider>
  );
};

export default App;
