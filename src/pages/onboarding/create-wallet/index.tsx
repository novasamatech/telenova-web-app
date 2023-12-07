import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ConfettiExplosion from 'react-confetti-explosion';

import { useTelegram } from '@/common/providers/telegramProvider';
import { getWallet } from '@common/wallet';
import { completeOnboarding } from '@common/telegram';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import Icon from '@/components/Icon/Icon';

export default function CreateWalletPage() {
  const router = useRouter();
  const { MainButton, webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const wallet = getWallet();
    if (!wallet) {
      console.error("Can't create wallet");

      return;
    }
    completeOnboarding(wallet.publicKey, webApp);
    setTimeout(() => {
      setIsLoading(false);
      MainButton?.show();
      MainButton?.setText('Get started');
      MainButton?.hideProgress();
      MainButton?.onClick(() => {
        router.push(Paths.DASHBOARD);
      });
    }, 2000);

    return () => {
      MainButton?.hide();
      MainButton?.setText('Continue');
      MainButton?.hideProgress();
    };
  }, [MainButton]);

  return isLoading ? (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Icon name="createWallet" size={256} alt="create wallet" priority />
      <BodyText>Creating your wallet</BodyText>
    </div>
  ) : (
    <div className="h-screen flex flex-col justify-center items-center m-5">
      <div className="bg-blue-500 rounded-full p-9">
        <ConfettiExplosion particleCount={250} />
        <Icon name="firework" size={60} alt="firework" />
      </div>
      <TitleText className="m-3">Your wallet has been created!</TitleText>
      <BodyText className="text-text-hint" align="center">
        Your gateway to the world of digital assets is now open, and your financial future is in your hands. Safely
        store, send, and receive funds with confidence.
        <br />
        Happy exploring!
      </BodyText>
    </div>
  );
}
