import React, { useEffect } from 'react';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { getWallet } from '@common/wallet';
import { Layout } from '@/components';
import OnboardingStartPage from './onboarding';
import DashboardMainPage from './dashboard';

export default function App() {
  const { setPublicKey } = useGlobalContext();
  const wallet = getWallet();

  useEffect(() => {
    setPublicKey(wallet?.publicKey);
  }, []);

  return wallet ? (
    <Layout>
      <DashboardMainPage />
    </Layout>
  ) : (
    <OnboardingStartPage />
  );
}
