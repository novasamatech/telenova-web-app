import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { MNEMONIC_STORE } from '@/common/utils';
import { getCloudStorageItem } from '@/common/wallet';
import { LoadingScreen } from '@/components';

const delay = (ttl: number) => new Promise(resolve => setTimeout(resolve, ttl));

const Page = () => {
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    Promise.all([getCloudStorageItem(MNEMONIC_STORE), delay(1000)]).then(([value]) => {
      if (!mounted) return;

      if (value) {
        navigate($path('/onboarding/restore/:mnemonic', { mnemonic: value }), { replace: true });
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
