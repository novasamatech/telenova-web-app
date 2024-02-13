import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMainButton } from '@/common/telegram/useMainButton';
import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, MediumTitle } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';

export const OnboardingStartPage = () => {
  const navigate = useNavigate();
  const { mainButton, addMainButton, reset } = useMainButton();
  const { user, startParam } = useTelegram();

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

  const headerText = startParam
    ? `Hey ${user?.first_name || 'friend'}!\nYou have received a gift!`
    : 'Welcome to Telenova!';

  const welcomeText = startParam
    ? 'Lets create a wallet for you so you can claim it!'
    : 'Securely receive, store, and send your Polkadot ecosystem assets with ease! Telenova lets you handle your Polkadot assets with ease!';

  return (
    <>
      <Icon name="Welcome" size={128} />
      <pre>
        <TitleText className="mt-6 mb-3">{headerText}</TitleText>
      </pre>
      <BodyText className="text-text-hint mb-8">{welcomeText}</BodyText>
      <div className="flex gap-4 mb-6">
        <Icon name="DOT" size={48} />
        <div>
          <MediumTitle>Easy crypto operations</MediumTitle>
          <BodyText className="text-text-hint" align="left">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.
          </BodyText>
        </div>
      </div>
      <div className="flex gap-4">
        <Icon name="DOT" size={48} />
        <div>
          <MediumTitle>Easy crypto operations</MediumTitle>
          <BodyText className="text-text-hint" align="left">
            Welcome aboard! Securely store, send, and receive your Polkadot funds with ease.
          </BodyText>
        </div>
      </div>
    </>
  );
};
