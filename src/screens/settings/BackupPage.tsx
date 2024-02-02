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
    <div className="flex flex-col items-start gap-2">
      <TitleText>Cloud Backup</TitleText>
      <BodyText className="text-text-hint mb-2" align="left">
        Your password protects your wallet and your assets. Make sure to keep your password safe (don&apos;t forget it!)
        and never share it with anyone!
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
      <TitleText className="mt-4">Manual Backup</TitleText>
      <BodyText className="text-text-hint mb-2" align="left">
        You can manually write down your recovery phrase to be sure that everything is safe
      </BodyText>
      <Plate className="w-full p-0">
        <LinkCard
          href={Paths.SETTINGS_RECOVERY}
          className="grid-cols-[1fr,auto]"
          text="Reveal Recovery Phrase"
          showArrow
        />
      </Plate>
    </div>
  );
}
