import { useEffect, useState } from 'react';

import { useTelegram } from '@common/providers/telegramProvider';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';

export default function OnboardingPage() {
  const { MainButton, webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    MainButton?.show();

    webApp?.CloudStorage.getItem('mnemonic', (_err, value) => {
      setMnenonic(value);
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [webApp]);

  if (isLoading) return <div> LOADING</div>;

  return (
    <div className="min-h-screen flex flex-col items-center text-center p-4">
      {mnemonic ? <RestoreWalletPage /> : <OnboardingStartPage />}
    </div>
  );
}
