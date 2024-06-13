import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers/telegramProvider';
import { BodyText, RecoveryPhrase, TitleText } from '@/components';

export default function RecoveryPage() {
  const { BackButton } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate($path('/settings/backup'));
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <TitleText>Recovery Phrase</TitleText>
      <BodyText align="left" className="text-text-hint mb-2">
        Do not use clipboard or screenshots on your mobile device, try to find secure methods for backup (e.g. paper)
      </BodyText>
      <RecoveryPhrase />
      <BodyText align="left" className="text-text-hint my-2">
        Please make sure to write down your phrase correctly and legibly.
      </BodyText>
    </div>
  );
}
