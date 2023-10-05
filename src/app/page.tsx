"use client"

import OnboardingLayout from './onboarding/layout'
import OnboardingStartPage from './onboarding/start/page'
import DashboardLayout from './dashboard/layout'
import DashboardPage from './dashboard/main/page'
import SplashPage from './splash/page'
import { Wallet, getWallet } from '@common/wallet'
import { useState, useEffect } from 'react'

export default function WelcomePage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isWalletLoaded, setWalletLoaded] = useState<boolean>(false);

  useEffect(() => {
    const wallet = getWallet();
    setWallet(wallet);
    setWalletLoaded(true);
  }, [setWallet])

  if (isWalletLoaded) {
    if (wallet) {
      return (
        <DashboardLayout>
          <DashboardPage/>
        </DashboardLayout>
      );
    } else {
      return (
        <OnboardingLayout>
          <OnboardingStartPage/>
        </OnboardingLayout>
      );
    }
  } else {
    return <SplashPage/>
  }
}
