import { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';
import { useErrorBoundary } from 'react-error-boundary';

import { useGlobalContext } from '@/common/providers/contextProvider';
import { getWallet } from '@common/wallet';
import { Layout } from '@/components';
import { Paths } from '@/common/routing';
import { routesConfig } from '@/common/routing/router';

export default function App() {
  const { showBoundary } = useErrorBoundary();
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();
  const appRoutes = useRoutes(routesConfig);

  useEffect(() => {
    getWallet()
      .then((wallet) => {
        if (!wallet) {
          return navigate(Paths.ONBOARDING, { replace: true });
        }
        setPublicKey(wallet?.publicKey);
        navigate(Paths.DASHBOARD, { replace: true });
      })
      .catch((err) => {
        showBoundary(err);
      });
  }, []);

  return <Layout>{appRoutes}</Layout>;
}
