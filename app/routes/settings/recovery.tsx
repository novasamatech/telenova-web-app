import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { TelegramApi } from '@/shared/api';
import { BackButton } from '@/shared/api/telegram/ui/BackButton.tsx';
import { MNEMONIC_STORE } from '@/shared/helpers';
import { BodyText, TitleText } from '@/ui/atoms';
import { RecoveryPhrase } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null);

  useEffect(() => {
    TelegramApi.getItem(MNEMONIC_STORE).then(setMnemonic);
  }, []);

  return (
    <>
      <BackButton onClick={() => navigate($path('/settings/backup'))} />
      <div className="flex flex-col items-start gap-2">
        <TitleText>Recovery Phrase</TitleText>
        <BodyText align="left" className="mb-2 text-text-hint">
          Do not use clipboard or screenshots on your mobile device, try to find secure methods for backup (e.g. paper)
        </BodyText>
        <RecoveryPhrase mnemonic={mnemonic} />
        <BodyText align="left" className="my-2 text-text-hint">
          Please make sure to write down your phrase correctly and legibly.
        </BodyText>
      </div>
    </>
  );
};

export default Page;
