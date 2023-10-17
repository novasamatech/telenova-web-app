import { useState, useEffect } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom';
import { getWallet } from '@common/wallet'
import { ErrorBoundary } from 'react-error-boundary';
import { Paths, routesConfig } from '@common/routing';

export function Main() {
  const navigate = useNavigate();
  const appRoutes = useRoutes(routesConfig);

  useEffect(() => {
    let currentUrl = window.location.href;
    console.log(`Current url: ${currentUrl}`);

    const wallet = getWallet();

    if (wallet) {
      navigate(Paths.DASHBOARD, { replace: true });
    } else {
      navigate(Paths.ONBOARDING, { replace: true });
    }
  }, [])

  return  (
      <div>
        { appRoutes }
      </div>
  );
}