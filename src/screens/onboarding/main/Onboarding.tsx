import { useEffect, useState } from 'react';

import { useTelegram } from '@common/providers/telegramProvider';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';
import { MNEMONIC_STORE } from '@/common/utils/constants';
import { BodyText, Icon } from '@/components';

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
  }, []);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-[93svh]">
        <Icon name="Loader" size={130} className="animate-pulse m-auto pl-5" />
        <BodyText className="text-text-on-button-disabled mb-2">by</BodyText>
        <Icon name="Novasama" size={110} className="ml-[10px]" />
      </div>
    );

  return (
    <div className="flex flex-col items-center text-center">
      {mnemonic ? <RestoreWalletPage mnemonic={mnemonic} /> : <OnboardingStartPage />}
    </div>
  );
}
