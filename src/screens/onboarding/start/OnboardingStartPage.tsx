import { useEffect } from 'react';
import { Avatar } from '@nextui-org/react';
import { useRouter } from 'next/router';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, CaptionText } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';

export const OnboardingStartPage = () => {
  const router = useRouter();
  const { MainButton } = useTelegram();

  useEffect(() => {
    MainButton?.show();
    MainButton?.onClick(() => {
      router.push(Paths.ONBOARDING_PASSWORD);
      MainButton?.showProgress(false);
    });

    return () => {
      MainButton?.hideProgress();
      MainButton?.disable();
    };
  }, [MainButton]);

  return (
    <div className="h-screen flex flex-col items-center p-4">
      <Avatar src="" size="lg" className="w-[128px] h-[128px]" name="Nova" />
      <TitleText className="mt-6 mb-3">Welcome to Nova Wallet!</TitleText>
      <BodyText className="text-text-hint mb-7" align="center">
        Welcome aboard! Securely store, send, and receive your Polkadot funds with ease. Dive into Polkadot funds
        management!
      </BodyText>
      <div className="flex gap-4 mb-6">
        <Icon name="DOT" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </div>
      </div>
      <div className="flex gap-4">
        <Icon name="DOT" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </div>
      </div>
    </div>
  );
};