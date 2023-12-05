'use client';
import { useEffect } from 'react';
import { Avatar } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-dom-confetti';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, CaptionText } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';

export default function OnboardingStartPage() {
  const router = useRouter();
  const { MainButton } = useTelegram();

  useEffect(() => {
    MainButton?.show();
    MainButton?.onClick(() => {
      MainButton?.showProgress(false);
      router.push(Paths.ONBOARDING_PASSWORD);
    });

    return () => {
      MainButton?.hideProgress();
    };
  }, [MainButton]);
  const config = {
    angle: 90,
    spread: '285',
    startVelocity: 40,
    elementCount: '160',
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '20px',
    height: '20px',
    perspective: '516px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };
  return (
    <div className="h-screen flex flex-col items-center m-4">
      <Confetti active/>
      <Avatar src="" size="lg" className="w-[128px] h-[128px]" name="Nova" />
      <TitleText className="mt-6 mb-3">Welcome to Nova Wallet!</TitleText>
      <BodyText className="text-text-hint mb-7" align="center">
        Welcome aboard! Securely store, send, and receive your Polkadot funds with ease. Dive into Polkadot funds
        management!
      </BodyText>
      <div className="flex gap-4 mb-6">
        <Icon name="dotLogo" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </div>
      </div>
      <div className="flex gap-4">
        <Icon name="dotLogo" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </div>
      </div>
    </div>
  );
}
