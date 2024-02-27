import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMainButton } from '@/common/telegram/useMainButton';
import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { TitleText, BodyText, MediumTitle } from '@/components/Typography';
import Icon from '@/components/Icon/Icon';
import { IconNames } from '@/components/Icon/types';

const welcomeData = [
  {
    title: 'Send crypto through Telegram',
    text: 'Effortlessly send Polkadot ecosystem assets to your Telegram contacts or to any on-chain address!',
    icon: 'UserWelcome',
  },
  {
    title: 'Polkadot in Telegram',
    text: 'Get started in the Polkadot ecosystem right from Telegram. It is the easiest way to get started in the Polkadot!',
    icon: 'DotWelcome',
  },
  {
    title: 'Safe & Seamless',
    text: 'Access your self-custodial crypto from any device secured by your Telenova password. Only you have access to your crypto.',
    icon: 'SuccessWelcome',
  },
];

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

  return (
    <>
      <Icon name="Welcome" size={128} />
      <pre>
        <TitleText className="mt-4 mb-2">{headerText}</TitleText>
      </pre>
      {startParam && (
        <BodyText className="text-text-hint px-4 mb-2">To claim it, let’s create a wallet. It’s super quick.</BodyText>
      )}
      {welcomeData.map(({ title, text, icon }) => (
        <div key={title} className="flex gap-4 px-4 mt-6">
          <span>
            <Icon name={icon as IconNames} size={48} />
          </span>
          <div>
            <MediumTitle>{title}</MediumTitle>
            <BodyText className="text-text-hint mt-1" align="left">
              {text}
            </BodyText>
          </div>
        </div>
      ))}
    </>
  );
};
