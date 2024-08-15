import type { LinksFunction } from '@remix-run/node';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { LoadingScreen } from '@/components';
import { telegramModel } from '@/models';
import { telegramApi } from '@/shared/api';
import { MNEMONIC_STORE } from '@/shared/helpers';

function delay(ttl: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ttl));
}

// Create-wallet.json is heavy ~410Kb, nice to prefetch
export const links: LinksFunction = () => [{ rel: 'prefetch', href: '/assets/lottie/Create-wallet.json', as: 'fetch' }];

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  useEffect(() => {
    if (!webApp) return;

    let mounted = true;
    Promise.all([telegramApi.getCloudStorageItem(webApp, MNEMONIC_STORE), delay(1000)]).then(([mnemonic]) => {
      if (!mounted) return;

      if (mnemonic) {
        navigate($path('/onboarding/restore'), { replace: true, state: { mnemonic } });
      } else {
        navigate($path('/onboarding/start'), { replace: true });
      }
    });

    return () => {
      mounted = false;
    };
  }, [webApp]);

  return <LoadingScreen />;
};

export default Page;
