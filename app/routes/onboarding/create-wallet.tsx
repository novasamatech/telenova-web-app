import type { PlayerEvent } from '@lottiefiles/react-lottie-player';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { completeOnboarding } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton';
import { telegramModel, walletModel } from '@/models';
import { BodyText, HeadlineText, LottiePlayer, TitleText } from '@/ui/atoms';

export const loader = () => {
  return json({
    botApiUrl: process.env.PUBLIC_BOT_API_URL,
  });
};

const Page = () => {
  const { botApiUrl } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);
  const wallet = useUnit(walletModel.$wallet);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!wallet?.publicKey) {
      console.error("Can't create wallet when public key is missing");

      return;
    }

    if (!webApp) {
      console.error("Can't create wallet when web app is missing");

      return;
    }

    // TODO: Handle errors here and display retry page maybe
    completeOnboarding({ webApp, publicKey: wallet.publicKey, baseUrl: botApiUrl }).catch(() => {
      console.warn('Onboarding failed');
    });
  }, []);

  const handleOnEvent = (event: PlayerEvent) => {
    if (event === 'complete') {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MainButton text="Get started" hidden={isLoading} onClick={() => navigate($path('/dashboard'))} />
      <div className="flex h-[95vh] flex-col items-center justify-center">
        <LottiePlayer
          autoplay
          keepLastFrame
          sources={['/assets/lottie/Create-wallet.json']}
          className="player mb-4 h-[256px] w-[256px]"
          onEvent={event => handleOnEvent(event)}
        />
        <div className="h-[150px]">
          {isLoading ? (
            <>
              <div className="animate-text mt-5 opacity-0">
                <HeadlineText className="text-text-hint" align="center">
                  Creating your wallet...
                </HeadlineText>
              </div>
              <div className="delay-1 mt-3 opacity-0">
                <HeadlineText className="text-text-hint" align="center">
                  Encrypting your wallets keys
                </HeadlineText>
              </div>
              <div className="delay-2 opacity-0">
                <HeadlineText className="text-text-hint" align="center">
                  Backing up keys in your Telegram cloud
                </HeadlineText>
              </div>
            </>
          ) : (
            <>
              <TitleText>Your wallet has been created!</TitleText>
              <BodyText className="m-3 text-text-hint">
                Your Telenova wallet is now ready to use! You can now begin exploring Polkadot ecosystem assets with
                ease!
              </BodyText>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
