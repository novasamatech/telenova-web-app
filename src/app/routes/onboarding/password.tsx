import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { backupMnemonic, createWallet, generateWalletMnemonic } from '@/common/wallet';
import { BodyText, CreatePasswordForm, TitleText } from '@/components';

const Page: FC = () => {
  const navigate = useNavigate();
  const { user, startParam } = useTelegram();
  const { setPublicKey } = useGlobalContext();

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const submit = () => {
    const mnemonic = generateWalletMnemonic();
    const wallet = createWallet(mnemonic as string);

    setPublicKey(wallet?.publicKey);
    backupMnemonic(mnemonic, password);
    navigate($path('/onboarding/create-wallet'));
  };

  return (
    <>
      <MainButton disabled={!valid} onClick={submit} />
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
