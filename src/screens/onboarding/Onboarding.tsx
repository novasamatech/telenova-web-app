import { useEffect, useState } from 'react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { BACKUP_DATE, MNEMONIC_STORE } from '@/common/utils/constants';
import { getStoreName } from '@/common/wallet';
import { LoadingScreen } from '@/components';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';

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
