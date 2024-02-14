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
    title: 'Send to anyone in Telegram',
    text: 'Effortlessly send Polkadot ecosystem assets to your Telegram contacts or to any on-chain address!',
    icon: 'UserWelcome',
  },
  {
    title: 'Polkadot in Telegram',
    text: 'Get started in the Polkadot ecosystem right from Telegram. It is the easiest way to get started in the Polkadot!',
    icon: 'DotWelcome',
  },
  {
    title: 'Safe & Seamless',
    text: 'Telegram’s cloud backup allows you to recover your account at any time from a new device using your Telegram login and your Telenova password!',
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

  const welcomeText = startParam
    ? 'To claim it, let’s create a wallet. It’s  super quick. Telenova is the easiest way to Securely receive, store, and send your Polkadot ecosystem assets!'
    : 'Telenova is the easiest way to Securely receive, store, and send your Polkadot ecosystem assets!';

  return (
    <>
      <Icon name="Welcome" size={128} />
      <pre>
        <TitleText className="mt-2 mb-3">{headerText}</TitleText>
      </pre>
      <BodyText className="text-text-hint px-4">{welcomeText}</BodyText>
      {welcomeData.map(({ title, text, icon }) => (
        <div key={title} className="flex gap-4 px-4 mt-6">
          <span>
            <Icon name={icon as IconNames} size={48} />
          </span>
          <div>
            <MediumTitle>{title}</MediumTitle>
            <BodyText className="text-text-hint mt-2" align="left">
              {text}
            </BodyText>
          </div>
        </div>
      ))}
    </>
  );
};
