import { type PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type LinksFunction, type LoaderFunction, type MetaFunction, json } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from '@remix-run/react';
import { useUnit } from 'effector-react';

import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ExtrinsicProvider } from '@/common/extrinsicService';
import { GlobalStateProvider } from '@/common/providers/contextProvider';
import { ErrorScreen } from '@/components';
import * as models from '@/models';

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

export const loader = (() => {
  return json({
    file: process.env.PUBLIC_CHAINS_FILE,
  });
}) satisfies LoaderFunction;

const DataContext = ({ children }: PropsWithChildren) => {
  const { file } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const webAppError = useUnit(models.telegramModel.$error);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    models.navigationModel.input.navigatorChanged(navigate);
  }, [navigate]);

  useEffect(() => {
    models.telegramModel.input.webAppStarted();
    models.networkModel.input.networkStarted(file);

    cryptoWaitReady().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

  if (webAppError) return <ErrorScreen error={webAppError.message} />;

  return (
    <GlobalStateProvider>
      <ExtrinsicProvider>{children}</ExtrinsicProvider>
    </GlobalStateProvider>
  );
};

const App = () => {
  return (
    <main className="flex justify-center font-manrope">
      <div className="min-h-screen w-full overflow-x-auto break-words p-4">
        <Outlet />
      </div>
    </main>
  );
};

export default App;
