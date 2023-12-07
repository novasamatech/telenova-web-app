'use client';
import { useEffect } from 'react';
// import { useRouter } from 'next/router';

import { useTelegram } from '@/common/providers/telegramProvider';
// import { Paths } from '@/common/routing';

export const RestoreWalletPage = () => {
  // const router = useRouter();
  const { MainButton } = useTelegram();

  useEffect(() => {
    MainButton?.disable();
    // MainButton?.onClick(() => {
    //   router.push(Paths.DASHBOARD);
    //   MainButton?.showProgress(false);
    // });

    return () => {
      MainButton?.hideProgress();
    };
  }, [MainButton]);

  return (
    <div className="h-screen flex justify-center items-center">
      <label>Import Wallet Goes Here</label>
    </div>
  );
};
