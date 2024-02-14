import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Avatar, Input } from '@nextui-org/react';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { createWallet, initializeWalletFromCloud } from '@/common/wallet';

type Props = {
  mnemonic: string;
};

export const RestoreWalletPage = ({ mnemonic }: Props) => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const { setPublicKey } = useGlobalContext();

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    mainButton.show();
    mainButton.disable();
  }, []);

  useEffect(() => {
    const callback = () => {
      if (password.length < 8) {
        setIsPasswordValid(false);

        return;
      }
      const decryptedMnemonic = initializeWalletFromCloud(password, mnemonic);
      const wallet = createWallet(decryptedMnemonic);
      setIsPasswordValid(Boolean(wallet));
      if (wallet) {
        setPublicKey(wallet?.publicKey);
        navigate(Paths.DASHBOARD);
      }
    };

    if (password.length) {
      mainButton.enable();
      addMainButton(callback);
    } else {
      mainButton.disable();
    }

    return () => {
      reset();
    };
  }, [password]);

  return (
    <>
      <Avatar
        src={user?.photo_url}
        size="lg"
        classNames={{
          base: 'bg-[--tg-theme-button-color]',
          name: 'font-manrope font-black text-base text-white',
        }}
        className="w-[64px] h-[64px]"
        name={user?.first_name[0]}
      />
      <TitleText className="m-4 px-6">Welcome back, {user?.first_name || 'friend'}!</TitleText>
      <BodyText as="span" className="text-text-hint px-6 mb-8">
        We&apos;ve found a backup of your existing Telenova wallet in the cloud. To get access to it just enter the
        password you used when creating the wallet
      </BodyText>
      <Input
        isClearable
        placeholder="Enter Password Here"
        type="password"
        className="max-w-sm text-left"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1 shadow-none',
            'rounded-lg group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
          clearButton: ['text-text-hint'],
        }}
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
    </>
  );
};
