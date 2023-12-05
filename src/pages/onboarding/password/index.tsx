'use client';
import { useRouter } from 'next/router';
import { Avatar } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { createWallet, generateWalletMnemonic, storeMnemonic } from '@common/wallet';
import { BodyText, TitleText } from '@/components/Typography';
import PasswordForm from '@/components/PasswordForm/PasswordForm';

export default function PasswordPage() {
  const { user, MainButton } = useTelegram();
  const router = useRouter();

  MainButton?.disable();

  const handleSubmit = (password: string) => {
    MainButton?.enable();
    MainButton?.onClick(() => {
      router.push(Paths.ONBOARDING_CREATE_WALLET);

      const mnemonic = generateWalletMnemonic();
      createWallet(mnemonic);
      storeMnemonic(mnemonic, password);
    });
  };

  return (
    <div className="flex flex-col items-center text-center m-4">
      <Avatar src={user?.photo_url} size="lg" className="w-[64px] h-[64px]" name={user?.first_name[0]} />
      <TitleText className="m-4 px-6">Hey {user?.first_name}! Let’s secure your new wallet</TitleText>
      <BodyText className="text-text-hint px-6" align="center">
        It's like locking the door to your financial fortress. Your chosen password will be the key to ensure your
        assets are safe and sound.
      </BodyText>
      <PasswordForm onSubmit={handleSubmit} />
    </div>
  );
}
