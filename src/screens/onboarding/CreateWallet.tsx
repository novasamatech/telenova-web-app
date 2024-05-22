import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, PlayerEvent } from '@lottiefiles/react-lottie-player';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { completeOnboarding } from '@common/telegram';
import { BodyText, HeadlineText, TitleText } from '@/components/Typography';
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
    })();

    return () => {
      hideMainButton();
    };
  }, []);

  const handleOnEvent = (event: PlayerEvent) => {
    if (event === 'complete') {
      setIsLoading(false);
      addMainButton(() => {
        navigate(Paths.DASHBOARD);
      }, 'Get started');
      mainButton.hideProgress();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[95vh]">
      <Player
        src="/gifs/create-wallet.json"
        keepLastFrame
        autoplay
        className="player w-[256px] h-[256px] mb-4"
        onEvent={(event) => handleOnEvent(event)}
      />
      <div className="h-[150px]">
        {isLoading ? (
          <>
            <div className="opacity-0 animate-text mt-5">
              <HeadlineText className="text-text-hint" align="center">
                Creating your wallet...
              </HeadlineText>
            </div>
            <div className="mt-3 opacity-0 delay-1">
              <HeadlineText className="text-text-hint" align="center">
                Encrypting your wallets keys
              </HeadlineText>
            </div>
            <div className="opacity-0 delay-2">
              <HeadlineText className="text-text-hint" align="center">
                Backing up keys in your Telegram cloud
              </HeadlineText>
            </div>
          </>
        ) : (
          <>
            <TitleText>Your wallet has been created!</TitleText>
            <BodyText className="text-text-hint m-3">
              Your Telenova wallet is now ready to use! You can now begin exploring Polkadot ecosystem assets with ease!
            </BodyText>
          </>
        )}
      </div>
    </div>
  );
}
