import { useEffect, useState } from 'react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { MNEMONIC_STORE } from '@/common/utils/constants';
import { LoadingScreen } from '@/components';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';

export default function OnboardingPage() {
  const { webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
      if (value) {
        setMnenonic(value);
      }
    });

    // to avoid blinking
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [webApp]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col items-center text-center">
      {mnemonic ? <RestoreWalletPage mnemonic={mnemonic} /> : <OnboardingStartPage />}
    </div>
  );
}
