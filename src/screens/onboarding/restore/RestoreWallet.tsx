'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Avatar, Input } from '@nextui-org/react';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { initializeWalletFromCloud } from '@/common/wallet';

type Props = {
  mnemonic: string;
};

export const RestoreWalletPage = ({ mnemonic }: Props) => {
  const router = useRouter();
  const { MainButton, user } = useTelegram();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    MainButton?.show();
    MainButton?.disable();
  }, []);

  useEffect(() => {
    if (password.length) {
      MainButton?.enable();

      MainButton?.onClick(() => {
        if (password.length < 8) {
          setIsPasswordValid(false);

          return;
        }
        const isWalletInitialized = initializeWalletFromCloud(password, mnemonic);
        setIsPasswordValid(isWalletInitialized);

        if (isWalletInitialized) {
          router.push(Paths.DASHBOARD);
        }
      });
    } else {
      MainButton?.disable();
    }
  }, [password]);

  return (
    <>
      <Avatar src={user?.photo_url} size="lg" className="w-[64px] h-[64px]" name={user?.first_name[0]} />
      <TitleText className="m-4 px-6">Welcome back {user?.first_name || 'friend'}!</TitleText>
      <BodyText as="span" className="text-text-hint px-6 mb-8">
        We&apos;ve discovered a backup of your existing wallet in the cloud. To restore it just enter your password.
      </BodyText>
      <Input
        isClearable
        variant="flat"
        placeholder="Enter 8-character password here"
        type="password"
        className="max-w-sm text-left"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1',
            'group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
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
