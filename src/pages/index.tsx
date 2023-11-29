import React from 'react';
import { useRouter } from 'next/router';
import { getWallet } from '@/common/wallet';
import OnboardingStartPage from './onboarding';
import { DashboardMainPage } from './dashboard';

export default function App() {
  const router = useRouter();
  const wallet = getWallet();

  return wallet ? <DashboardMainPage /> : <OnboardingStartPage />;
}
