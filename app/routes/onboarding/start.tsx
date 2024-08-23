import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { telegramModel } from '@/models/telegram';
import { BodyText, Icon, MediumTitle, TitleText } from '@/ui/atoms';
import { type IconNames } from '@/ui/atoms/types';

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

const Page = () => {
  const navigate = useNavigate();

  const [user, startParam] = useUnit([telegramModel.$user, telegramModel.$startParam]);

  const headerText = startParam
    ? `Hey ${user?.first_name || 'friend'}!\nYou have received a gift!`
    : 'Welcome to Telenova!';

  return (
    <>
      <MainButton onClick={() => navigate($path('/onboarding/password'))} />
      <div className="flex flex-col items-center text-center">
        <Icon name="Welcome" size={128} className="mx-auto" />
        <pre>
          <TitleText className="mb-2 mt-4">{headerText}</TitleText>
        </pre>
        {startParam && (
          <BodyText className="mb-2 px-4 text-text-hint">
            To claim it, let’s create a wallet. It’s super quick.
          </BodyText>
        )}
        {welcomeData.map(({ title, text, icon }) => (
          <div key={title} className="mt-6 flex gap-4 px-4">
            <span>
              <Icon name={icon as IconNames} size={48} />
            </span>
            <div>
              <MediumTitle>{title}</MediumTitle>
              <BodyText className="mt-1 text-text-hint" align="left">
                {text}
              </BodyText>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Page;
