import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { walletModel } from '@/models/wallet';
import { MainButton, TelegramApi, cryptoApi } from '@/shared/api';
import { BodyText, TitleText } from '@/ui/atoms';
import { CreatePasswordForm } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);

  const user = TelegramApi.initDataUnsafe.user;

  const onSubmit = () => {
    const mnemonic = cryptoApi.generateMnemonic();

    walletModel.input.walletCreated(mnemonic);
    walletModel.input.mnemonicChanged({ mnemonic, password });
    navigate($path('/onboarding/complete'));
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
          {!TelegramApi.initDataUnsafe.start_param && `Hey ${user?.first_name || 'friend'}! `}Let’s set a password to
          secure your new wallet
        </TitleText>
        <BodyText className="px-4 text-text-hint">
          You should set a strong password to secure your wallet. The password you choose will keep your assets safe and
          sound.
        </BodyText>
        <CreatePasswordForm password={password} onChange={setPassword} onStatusChange={setIsValid} />
      </div>
    </>
  );
};

export default Page;
