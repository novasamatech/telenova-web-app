import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { MNEMONIC_STORE } from '../../shared/helpers';

import { useTelegram } from '@/common/providers';
import { getCloudStorageItem } from '@/common/wallet';
import { LoadingScreen } from '@/components';

const delay = (ttl: number) => new Promise(resolve => setTimeout(resolve, ttl));

const Page = () => {
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    Promise.all([getCloudStorageItem(MNEMONIC_STORE), delay(1000)]).then(([mnemonic]) => {
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
