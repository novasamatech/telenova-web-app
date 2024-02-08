import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      }, 4500);
    })();

    return () => {
      hideMainButton();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Player src="/gifs/create-wallet.json" keepLastFrame autoplay className="player w-[256px] h-[256px] mb-4" />
      {isLoading ? (
        <BodyText className="text-icon-on-neutral">Creating your wallet...</BodyText>
      ) : (
        <>
          <TitleText>Your wallet has been created!</TitleText>
          <BodyText className="text-text-hint m-3">
            Your Telenova wallet is now ready to use! You can now begin exploring Polkadot ecosystem assets with ease!
            Remember, do NOT share your passwords with anyone!
          </BodyText>
          <BodyText className="text-text-hint">Remember, do NOT share your passwords with anyone!</BodyText>
        </>
      )}
    </div>
  );
}
