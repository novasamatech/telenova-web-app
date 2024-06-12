import { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';

import { useGlobalContext } from '@/common/providers/contextProvider';
import { getWallet } from '@common/wallet';
import { Layout } from '@/components';
import { Paths } from '@/common/routing';
import { routesConfig } from '@/common/routing/router';
export default function App() {
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();
  const appRoutes = useRoutes(routesConfig);

  useEffect(() => {
    getWallet().then((wallet) => {
      if (!wallet) {
        return navigate(Paths.ONBOARDING, { replace: true });
      }
      setPublicKey(wallet?.publicKey);
      navigate(Paths.DASHBOARD, { replace: true });
    });
  }, []);

  return <Layout>{appRoutes}</Layout>;
}
