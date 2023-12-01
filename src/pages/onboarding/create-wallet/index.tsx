import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ConfettiExplosion from 'react-confetti-explosion';

import { useTelegram } from '@/common/providers/telegramProvider';
import { getWallet } from '@common/wallet';
import { completeOnboarding } from '@common/telegram';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';

export default function CreateWalletPage() {
  const router = useRouter();
  const { MainButton } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const wallet = getWallet();
    if (!wallet) {
      console.error("Can't create wallet");
      return;
    }
    completeOnboarding(wallet.publicKey);
    setTimeout(() => {
      setIsLoading(false);
      MainButton?.show();
      MainButton?.setText('Get started');
      MainButton?.hideProgress();
      MainButton?.onClick(() => {
        router.push(Paths.DASHBOARD);
      });
    }, 2000);
  }, [MainButton]);

  return isLoading ? (
    <div className="flex flex-col justify-center items-center">
      <Image src="/images/create-gif.gif" width={256} height={256} alt="create wallet" />
      <BodyText>Creating your wallet</BodyText>
    </div>
  ) : (
    <div className="h-screen flex flex-col justify-center items-center m-5">
      <ConfettiExplosion particleCount={250} />
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
