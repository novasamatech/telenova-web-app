import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@nextui-org/react';

import { useMainButton } from '@/common/telegram/useMainButton';
import { useTelegram } from '@/common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { createWallet, generateWalletMnemonic, backupMnemonic } from '@common/wallet';
import { BodyText, TitleText } from '@/components/Typography';
import PasswordForm from '@/components/PasswordForm/PasswordForm';

export default function PasswordPage() {
  const { user } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    mainButton?.disable();
    mainButton?.show();

    return () => {
      reset();
    };
  });

  const handleSubmit = (password: string) => {
    mainButton?.enable();
    addMainButton(() => {
      navigate(Paths.ONBOARDING_CREATE_WALLET);

      const mnemonic = generateWalletMnemonic();
      const wallet = createWallet(mnemonic as string);

      setPublicKey(wallet?.publicKey);
      backupMnemonic(mnemonic, password);
    });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Avatar src={user?.photo_url} size="lg" className="w-[64px] h-[64px]" name={user?.first_name[0]} />
      <TitleText className="m-4 px-6">Hey {user?.first_name || 'friend'}! Let’s secure your new wallet</TitleText>
      <BodyText className="text-text-hint px-6">
        It&apos;s like locking the door to your financial fortress. Your chosen password will be the key to ensure your
        assets are safe and sound.
      </BodyText>
      <PasswordForm onSubmit={handleSubmit} />
    </div>
  );
}
