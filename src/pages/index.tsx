import React, { useEffect } from 'react';
import { getWallet } from '@common/wallet';
import OnboardingStartPage from './onboarding';
import DashboardMainPage from './dashboard';
import { useGlobalContext } from '@/common/providers/contextProvider';

export default function App() {
  const { setPublicKey } = useGlobalContext();
  const wallet = getWallet();

  useEffect(() => {
    setPublicKey(wallet?.publicKey);
  }, [wallet]);

  return wallet ? <DashboardMainPage /> : <OnboardingStartPage />;
}
