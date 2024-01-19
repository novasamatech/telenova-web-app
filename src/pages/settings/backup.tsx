'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { BodyText, LinkCard, Plate, TitleText } from '@/components';
import { BACKUP_DATE } from '@/common/utils/constants';

export default function SettingsBackupPage() {
  const { BackButton, webApp } = useTelegram();
  const router = useRouter();
  const [backupDate, setBackupDate] = useState('');

  useEffect(() => {
    BackButton?.show();
    const callback = () => router.push(Paths.SETTINGS);
    BackButton?.onClick(callback);

    webApp?.CloudStorage.getItem(BACKUP_DATE, (_err, value) => {
      const date = value ? new Date(+value).toDateString() : 'no date found';
      setBackupDate(date);
    });

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 gap-4 w-full">
      <TitleText>The wallet is backed up successfully</TitleText>
      <BodyText className="text-text-hint mb-2">
        Your earlier set password acts as the shield for your wallet. It transforms the encrypted seed phrase into a
        secure password.
      </BodyText>
      <Plate className="w-full p-0">
        <LinkCard
          href={Paths.SETTINGS_CHANGE_PASSWORD}
          className="grid-cols-[1fr,auto]"
          text="Change Password"
          showArrow
        />
      </Plate>
      <BodyText className="text-text-hint self-start">Last Changed: {backupDate}</BodyText>
    </div>
  );
}
