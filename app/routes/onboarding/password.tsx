import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { backupMnemonic, generateWalletMnemonic } from '@/common/wallet';
import { BodyText, CreatePasswordForm, TitleText } from '@/components';
import { telegramModel, walletModel } from '@/models';

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);
  const user = useUnit(telegramModel.$user);
  const startParam = useUnit(telegramModel.$startParam);

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  if (!webApp || !password) return null;

  const onSubmit = () => {
    const mnemonic = generateWalletMnemonic();

    walletModel.input.walletCreated(mnemonic);
    backupMnemonic(webApp, mnemonic, password);
    navigate($path('/onboarding/create-wallet'));
  };

  return (
    <>
      <MainButton disabled={!valid} onClick={onSubmit} />
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={user?.photo_url}
          size="lg"
          className="w-[64px] h-[64px]"
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
          name={user?.first_name.charAt(0)}
        />
        <TitleText className="my-4">
          {!startParam && `Hey ${user?.first_name || 'friend'}! `}Let’s set a password to secure your new wallet
        </TitleText>
        <BodyText className="text-text-hint px-4">
          You should set a strong password to secure your wallet. The password you choose will keep your assets safe and
          sound
        </BodyText>
        <CreatePasswordForm password={password} onChange={setPassword} onStatusChange={setValid} />
      </div>
    </>
  );
};

export default Page;
