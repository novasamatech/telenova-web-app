import { useEffect, useState } from 'react';

import { useTelegram } from '@common/providers/telegramProvider';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/common/utils/constants';
import { BodyText, Icon } from '@/components';
import { getStoreName } from '@/common/wallet';

export default function OnboardingPage() {
  const { webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    webApp?.CloudStorage.getItems([MNEMONIC_STORE, BACKUP_DATE], (_err, value) => {
      if (!value) return;
      setMnenonic(value[MNEMONIC_STORE]);
      localStorage.setItem(getStoreName(BACKUP_DATE), value[BACKUP_DATE]);
    });

    // to avoid blinking
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [webApp]);

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
