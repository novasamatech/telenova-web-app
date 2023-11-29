import { Paths } from '@common/routing';
import { useTelegram } from '@/common/providers/telegramProvider';
import { useRouter } from 'next/router';

import { Avatar } from '@nextui-org/react';

export default function OnboardingStartPage() {
  const router = useRouter();
  const { user, webApp } = useTelegram();
  console.log(user, webApp, 2);

  return (
    <div className="h-screen flex flex-col justify-center align-center m-6">
      <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" size="lg" className="w-20 h-20" />
      <h1 className="text-header-title">Welcome to Nova Wallet!</h1>
      <p>
        Welcome aboard! Securely store, send, and receive your Polkadot funds with ease. Dive into Polkadot funds
        management!
      </p>
      <span>Easy crypto operations</span>
      <p>Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.</p>
      <button className="btn mt-4 bg-text-link" onClick={() => router.push(Paths.ONBOARDING_CREATE_WALLET)}>
        Create Wallet
      </button>
      <button className="btn btn-blue mt-4" onClick={() => router.push(Paths.ONBOARDING_IMPORT_WALLET)}>
        Import Wallet
      </button>
    </div>
  );
}
