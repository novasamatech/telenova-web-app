import React from 'react';
import { getWallet } from '@common/wallet';
import OnboardingStartPage from './onboarding';
import DashboardMainPage from './dashboard';

export default function App() {
  const wallet = getWallet();

  return wallet ? <DashboardMainPage /> : <OnboardingStartPage />;
}
