import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { BackButton, TelegramApi } from '@/shared/api';
import { BACKUP_DATE } from '@/shared/helpers';
import { BodyText, TitleText } from '@/ui/atoms';
import { LinkCard } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [backupDate, setBackupDate] = useState('');

  useEffect(() => {
    const storeDate = localStorage.getItem(TelegramApi.getStoreName(BACKUP_DATE));
    const date = storeDate ? new Date(+storeDate).toUTCString() : '';

    setBackupDate(date);
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/settings'))} />
      <div className="flex flex-col items-start gap-2">
        <TitleText>Cloud Backup</TitleText>
        <BodyText className="mb-2 text-text-hint" align="left">
          Your password protects your wallet and your assets. Make sure to keep your password safe (don&apos;t forget
          it!) and never share it with anyone!
        </BodyText>
        <LinkCard
          href={$path('/settings/password/current')}
          className="grid-cols-[1fr,auto]"
          text="Change Password"
          showArrow
        />
        {backupDate && <BodyText className="self-start text-text-hint">Last Changed: {backupDate}</BodyText>}
        <TitleText className="mt-4">Manual Backup</TitleText>
        <BodyText className="mb-2 text-text-hint" align="left">
          You can manually write down your recovery phrase to be sure that everything is safe
        </BodyText>
        <LinkCard
          href={$path('/settings/recovery')}
          className="grid-cols-[1fr,auto]"
          text="Reveal Recovery Phrase"
          showArrow
        />
      </div>
    </>
  );
};

export default Page;
