import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ConfettiExplosion from 'react-confetti-explosion';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { completeOnboarding } from '@common/telegram';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';

export default function CreateWalletPage() {
  const router = useRouter();
  const { MainButton, webApp } = useTelegram();
  const { publicKey } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!publicKey) {
        console.error("Can't create wallet when public key is missing");

        return;
      }

      if (!webApp) {
        console.error("Can't create wallet when web app is missing");

        return;
      }

      // TODO: Handle errors here and display retry page maybe
      await completeOnboarding(publicKey, webApp);

      MainButton?.onClick(() => {
        router.push(Paths.DASHBOARD);
      });

      setTimeout(() => {
        setIsLoading(false);
        MainButton?.show();
        MainButton?.setText('Get started');
        MainButton?.hideProgress();
      }, 2000);
    })();

    return () => {
      MainButton?.setText('Continue');
      MainButton?.hide();
      MainButton?.hideProgress();
    };
  }, []);

  return isLoading ? (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <video autoPlay muted playsInline width={350} preload="auto">
        <source src={'/videos/create-wallet.webm'} type="video/webm" />
      </video>
      <BodyText className="text-icon-on-neutral">Creating your wallet...</BodyText>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col justify-center items-center p-5">
      <div className="bg-blue-500 rounded-full p-3 w-[114px] h-[114px]">
        <ConfettiExplosion particleCount={250} />
        <video autoPlay muted playsInline width={90} preload="auto">
          <source src={'/videos/firework1.webm'} type="video/webm" />
        </video>
      </div>
      <TitleText className="m-3">Your wallet has been created!</TitleText>
      <BodyText className="text-text-hint">
        Your gateway to the world of digital assets is now open, and your financial future is in your hands. Safely
        store, send, and receive funds with confidence.
        <br />
        Happy exploring!
      </BodyText>
    </div>
  );
}
