import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton.tsx';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { BACKUP_DATE } from '@/common/utils';
import { getStoreName } from '@/common/wallet';
import { BodyText, LinkCard, TitleText } from '@/components';

const Page: FC = () => {
  const { hideMainButton } = useMainButton();
  const navigate = useNavigate();
  const [backupDate, setBackupDate] = useState('');

  useEffect(() => {
    const storeDate = localStorage.getItem(getStoreName(BACKUP_DATE));
    const date = storeDate ? new Date(+storeDate).toUTCString() : '';
    setBackupDate(date);
    hideMainButton();
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/settings'))} />
      <div className="flex flex-col items-start gap-2">
        <TitleText>Cloud Backup</TitleText>
        <BodyText className="text-text-hint mb-2" align="left">
          Your password protects your wallet and your assets. Make sure to keep your password safe (don&apos;t forget
          it!) and never share it with anyone!
        </BodyText>
        <LinkCard
          href={$path('/settings/password/change')}
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
    </>
  );
};

export default Page;
