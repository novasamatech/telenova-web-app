import { type FC, useEffect, useState } from 'react';

import { useTelegram } from '@/common/providers';
import { MNEMONIC_STORE } from '@/common/utils';
import { getCloudStorageItem } from '@/common/wallet';
import { LoadingScreen } from '@/components';
import { OnboardingStartPage, RestoreWalletPage } from '@/screens/onboarding';

const delay = (ttl: number) => new Promise(resolve => setTimeout(resolve, ttl));

const Page: FC = () => {
  const { webApp } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [mnemonic, setMnenonic] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCloudStorageItem(MNEMONIC_STORE), delay(1000)]).then(([value]) => {
      if (mounted) {
        setMnenonic(value ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
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
