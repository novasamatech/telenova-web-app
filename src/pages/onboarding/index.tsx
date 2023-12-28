import { useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import { useTelegram } from '@common/providers/telegramProvider';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';
import { MNEMONIC_STORE } from '@/common/utils/constants';

export default function OnboardingPage() {
  const { webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
      setMnenonic(value as string | null);
    });

    // to avoid blinking
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [webApp]);

  // TODO: replace with loader
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Player src="/gifs/Welcome.json" loop autoplay className="player" />
      </div>
    );

  return (
    <div className="min-h-screen w-full flex flex-col items-center text-center p-4">
      {mnemonic ? <RestoreWalletPage mnemonic={mnemonic} /> : <OnboardingStartPage />}
    </div>
  );
}
