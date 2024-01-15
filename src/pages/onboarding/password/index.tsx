import { useRouter } from 'next/router';
import { Avatar } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { createWallet, generateWalletMnemonic, backupMnemonic } from '@common/wallet';
import { Paths } from '@/common/routing';
import { BodyText, TitleText } from '@/components/Typography';
import PasswordForm from '@/components/PasswordForm/PasswordForm';

export default function PasswordPage() {
  const { user, MainButton } = useTelegram();
  const { setPublicKey } = useGlobalContext();
  const router = useRouter();

  MainButton?.disable();
  MainButton?.show();

  const handleSubmit = (password: string) => {
    MainButton?.enable();
    MainButton?.onClick(() => {
      console.log(1, password);

      const mnemonic = generateWalletMnemonic();
      console.log('mnemonic', mnemonic, createWallet);

      const { publicKey } = createWallet(mnemonic);
      console.log('key', mnemonic, publicKey);

      setPublicKey(publicKey);
      backupMnemonic(mnemonic, password);
      router.push(Paths.ONBOARDING_CREATE_WALLET);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center text-center p-4">
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
