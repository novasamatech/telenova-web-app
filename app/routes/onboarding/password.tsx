import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { backupMnemonic, generateWalletMnemonic } from '@/common/wallet';
import { telegramModel } from '@/models/telegram';
import { walletModel } from '@/models/wallet';
import { BodyText, TitleText } from '@/ui/atoms';
import { CreatePasswordForm } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [webApp, user, startParam] = useUnit([telegramModel.$webApp, telegramModel.$user, telegramModel.$startParam]);

  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);

  if (!webApp) return null;

  const onSubmit = () => {
    const mnemonic = generateWalletMnemonic();

    walletModel.input.walletCreated(mnemonic);
    backupMnemonic(webApp, mnemonic, password);
    navigate($path('/onboarding/create-wallet'));
  };

  return (
    <>
      <MainButton disabled={!isValid} onClick={onSubmit} />
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={user?.photo_url}
          size="lg"
          className="h-[64px] w-[64px]"
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
          name={user?.first_name.charAt(0)}
        />
        <TitleText className="my-4">
          {!startParam && `Hey ${user?.first_name || 'friend'}! `}Let’s set a password to secure your new wallet
        </TitleText>
        <BodyText className="px-4 text-text-hint">
          You should set a strong password to secure your wallet. The password you choose will keep your assets safe and
          sound
        </BodyText>
        <CreatePasswordForm password={password} onChange={setPassword} onStatusChange={setIsValid} />
      </div>
    </>
  );
};

export default Page;
