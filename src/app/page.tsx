'use client';
import React, { useEffect, useState } from 'react';
import { getWallet } from '@common/wallet';
import OnboardingStartPage from './onboarding/page';
import DashboardMainPage from './dashboard/page';

export default function App() {
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);

  return render && (getWallet() ? <DashboardMainPage /> : <OnboardingStartPage />);
}
