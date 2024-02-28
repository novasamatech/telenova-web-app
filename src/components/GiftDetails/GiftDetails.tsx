import { WebApp } from '@twa-dev/types';

import { useMainButton } from '@/common/telegram/useMainButton';
import { BodyText, TitleText } from '@/components';
import { navigateTranferById } from '@/common/telegram';
import { TgLink } from '@/common/telegram/types';

type GiftDetailsProps = {
  link: TgLink | null;
  webApp: WebApp;
};

export default function GiftDetails({ link, webApp }: GiftDetailsProps) {
  const { addMainButton } = useMainButton();
  if (!link) return;

  addMainButton(() => navigateTranferById(webApp, link), 'Send to contact');

  return (
    <>
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="text-text-hint mt-auto" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
}
