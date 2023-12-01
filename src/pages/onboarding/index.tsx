import { useTelegram } from '@common/providers/telegramProvider';
import { useRouter } from 'next/router';

import { Avatar } from '@nextui-org/react';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, CaptionText } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';

export default function OnboardingStartPage() {
  const router = useRouter();
  const { webApp } = useTelegram();

  webApp?.MainButton?.show();
  webApp?.MainButton?.onClick(() => {
    router.push(Paths.ONBOARDING_PASSWORD);
  });

  return (
    <div className="h-screen flex flex-col items-center m-4">
      <Avatar src="" size="lg" className="w-[128px] h-[128px]" name="Nova" />
      <TitleText className="mt-6 mb-3">Welcome to Nova Wallet!</TitleText>
      <BodyText className="text-text-hint mb-7" align="center">
        Welcome aboard! Securely store, send, and receive your Polkadot funds with ease. Dive into Polkadot funds
        management!
      </BodyText>
      <div className="flex gap-4 mb-6">
        <Icon name="dotLogo" size={48} />
        <p>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </p>
      </div>
      <div className="flex gap-4">
        <Icon name="dotLogo" size={48} />
        <p>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.{' '}
          </BodyText>
        </p>
      </div>
    </div>
  );
}
