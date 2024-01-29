import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@nextui-org/react';

import { useMainButton } from '@/common/telegram/useMainButton';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, CaptionText } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';

export const OnboardingStartPage = () => {
  const navigate = useNavigate();
  const { mainButton, addMainButton, reset } = useMainButton();

  useEffect(() => {
    mainButton.enable();
    const callback = () => {
      navigate(Paths.ONBOARDING_PASSWORD);
      mainButton.showProgress(false);
    };
    addMainButton(callback);

    return () => {
      reset();
      mainButton.disable();
    };
  }, []);

  return (
    <>
      <Avatar src="" size="lg" className="w-[128px] h-[128px]" name="Nova" />
      <TitleText className="mt-6 mb-3">Welcome to Nova Wallet!</TitleText>
      <BodyText className="text-text-hint mb-8">
        Welcome aboard! Securely store, send, and receive your Polkadot funds with ease. Dive into Polkadot funds
        management!
      </BodyText>
      <div className="flex gap-4 mb-6">
        <Icon name="DOT" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint" align="left">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.
          </BodyText>
        </div>
      </div>
      <div className="flex gap-4">
        <Icon name="DOT" size={48} />
        <div>
          <CaptionText>Easy crypto operations</CaptionText>
          <BodyText className="text-text-hint" align="left">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.
          </BodyText>
        </div>
      </div>
    </>
  );
};
