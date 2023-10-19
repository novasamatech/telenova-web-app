import { useState, useEffect } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom';
import { getWallet } from '@common/wallet'
import { ErrorBoundary } from 'react-error-boundary';
import { Paths, routesConfig } from '@common/routing';
import { ChainRegistry } from '@common/chainRegistry';

export function Main() {
  const navigate = useNavigate();
  const appRoutes = useRoutes(routesConfig);

  useEffect(() => {
    const wallet = getWallet();

    if (wallet) {
      navigate(Paths.DASHBOARD, { replace: true });
    } else {
      navigate(Paths.ONBOARDING, { replace: true });
    }
  }, [])

  return  (
      <ChainRegistry>
        { appRoutes }
      </ChainRegistry>
  );
}