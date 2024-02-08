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
  const { user, startParam } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const { setPublicKey } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    mainButton.disable();
    mainButton.show();

    return () => {
      reset();
    };
  }, []);

  const handleSubmit = (password: string) => {
    mainButton.enable();
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
      <TitleText className="m-4 px-6">
        {!startParam && `Hey ${user?.first_name || 'friend'}! `}Let’s set a password to secure your new wallet
      </TitleText>
      <BodyText className="text-text-hint px-6">
        You should set a strong password to secure your wallet. The password you choose will keep your assets safe and
        sound
      </BodyText>
      <PasswordForm onSubmit={handleSubmit} />
    </div>
  );
}
