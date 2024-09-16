import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { telegramModel } from '@/models/telegram';
import { cryptoApi } from '@/shared/api';
import { BodyText, TitleText } from '@/ui/atoms';
import { RecoveryPhrase } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  if (!webApp) return null;

  return (
    <>
      <BackButton onClick={() => navigate($path('/settings/backup'))} />
      <div className="flex flex-col items-start gap-2">
        <TitleText>Recovery Phrase</TitleText>
        <BodyText align="left" className="mb-2 text-text-hint">
          Do not use clipboard or screenshots on your mobile device, try to find secure methods for backup (e.g. paper)
        </BodyText>
        <RecoveryPhrase mnemonic={cryptoApi.getMnemonic(webApp)} />
        <BodyText align="left" className="my-2 text-text-hint">
          Please make sure to write down your phrase correctly and legibly.
        </BodyText>
      </div>
    </>
  );
};

export default Page;
