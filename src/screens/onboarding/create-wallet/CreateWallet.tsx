import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfettiExplosion from 'react-confetti-explosion';
import { Player } from '@lottiefiles/react-lottie-player';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { completeOnboarding } from '@common/telegram';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';

export default function CreateWalletPage() {
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const { mainButton, addMainButton, hideMainButton } = useMainButton();
  const { publicKey } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    hideMainButton();
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

      setTimeout(() => {
        setIsLoading(false);
        addMainButton(() => {
          navigate(Paths.DASHBOARD);
        }, 'Get started');
        mainButton.hideProgress();
      }, 2000);
    })();

    return () => {
      hideMainButton();
    };
  }, []);
  console.log(isLoading);

  return isLoading ? (
    <div className="flex flex-col justify-center items-center">
      <Player src="/gifs/create-wallet.json" keepLastFrame autoplay className="player" />
      <BodyText className="text-icon-on-neutral">Creating your wallet...</BodyText>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center p-1">
      <div className="bg-blue-500 rounded-full p-3 w-[114px] h-[114px]">
        <ConfettiExplosion particleCount={250} />
        {/* <Player src="firework" className="player" /> */}
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
