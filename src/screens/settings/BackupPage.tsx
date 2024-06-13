import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { BACKUP_DATE } from '@/common/utils/constants';
import { BodyText, LinkCard, TitleText } from '@/components';

export default function SettingsBackupPage() {
  const { BackButton, webApp } = useTelegram();
  const { hideMainButton } = useMainButton();
  const navigate = useNavigate();
  const [backupDate, setBackupDate] = useState('');

  useEffect(() => {
    hideMainButton();
    BackButton?.show();
    const callback = () => navigate($path('/settings'));
    BackButton?.onClick(callback);

    webApp?.CloudStorage.getItem(BACKUP_DATE, (_err, value) => {
      const date = value ? new Date(+value).toUTCString() : '';
      setBackupDate(date);
    });

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <TitleText>Cloud Backup</TitleText>
      <BodyText className="text-text-hint mb-2" align="left">
        Your password protects your wallet and your assets. Make sure to keep your password safe (don&apos;t forget it!)
        and never share it with anyone!
      </BodyText>
      <LinkCard
        href={$path('/settings/change-password')}
        className="grid-cols-[1fr,auto]"
        text="Change Password"
        showArrow
      />
      {backupDate && <BodyText className="text-text-hint self-start">Last Changed: {backupDate}</BodyText>}
      <TitleText className="mt-4">Manual Backup</TitleText>
      <BodyText className="text-text-hint mb-2" align="left">
        You can manually write down your recovery phrase to be sure that everything is safe
      </BodyText>
      <LinkCard
        href={$path('/settings/recovery')}
        className="grid-cols-[1fr,auto]"
        text="Reveal Recovery Phrase"
        showArrow
      />
    </div>
  );
}
