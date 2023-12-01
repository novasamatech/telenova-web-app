import { useEffect } from 'react';
import Image from 'next/image';

import { getWallet } from '@common/wallet';
import { completeOnboarding } from '@common/telegram';
import { BodyText } from '@/components/Typography';

export default function CreateWalletPage() {
  useEffect(() => {
    const wallet = getWallet();
    if (!wallet) {
      console.error("Can't create wallet");
      return;
    }
    completeOnboarding(wallet.publicKey);
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Image src="/images/create-gif.gif" width={256} height={256} alt="create wallet" />
      <BodyText>Creating your wallet</BodyText>
    </div>
  );
}
