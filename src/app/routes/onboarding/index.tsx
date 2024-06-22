import { type FC, useEffect, useState } from 'react';

import { useTelegram } from '@/common/providers';
import { MNEMONIC_STORE } from '@/common/utils';
import { getCloudStorageItem } from '@/common/wallet';
import { LoadingScreen } from '@/components';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';

const Page: FC = () => {
  const { webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    getCloudStorageItem(MNEMONIC_STORE).then(value => {
      if (!value) return;
      setMnenonic(value);
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
};

export default Page;
