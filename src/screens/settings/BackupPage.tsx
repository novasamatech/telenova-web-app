'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { BodyText, LinkCard, Plate, TitleText } from '@/components';
import { BACKUP_DATE } from '@/common/utils/constants';

export default function SettingsBackupPage() {
  const { BackButton, webApp } = useTelegram();
  const navigate = useNavigate();
  const [backupDate, setBackupDate] = useState('');

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.SETTINGS);
    BackButton?.onClick(callback);

    webApp?.CloudStorage.getItem(BACKUP_DATE, (_err, value) => {
      const date = value ? new Date(+value).toDateString() : '';
      setBackupDate(date);
    });

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
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
      {backupDate && <BodyText className="text-text-hint self-start">Last Changed: {backupDate}</BodyText>}
    </div>
  );
}
