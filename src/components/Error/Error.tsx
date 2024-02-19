import Image from 'next/image';
import { Button } from '@nextui-org/react';

import { resetWallet } from '@/common/wallet';
import { BodyText, MediumTitle, TitleText } from '@/components';
import { Paths } from '@/common/routing';

const Error = () => {
  const handleReset = () => {
    resetWallet(true);
    window.location.replace(Paths.ONBOARDING_IMPORT_WALLET);
  };

  return (
    <div className="h-screen p-4 w-full flex flex-col items-center justify-center gap-3">
      <Image src="/images/error.svg" alt="error" width={100} height={100} />
      <TitleText className="mt-3">Unexpected Error</TitleText>
      <MediumTitle>Something went wrong, try again later</MediumTitle>
      <BodyText>
        If you encounter this error again, reopening the application or resetting your wallet locally by clicking the
        button below. Your wallet data is secure during this process.
      </BodyText>
      <Button className="font-manrope" onClick={handleReset}>
        Reset Wallet
      </Button>
    </div>
  );
};

export default Error;
