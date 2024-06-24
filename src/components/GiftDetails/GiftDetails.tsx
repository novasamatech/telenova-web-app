import { type WebApp } from '@twa-dev/types';

import { navigateTranferById } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { type TgLink } from '@/common/telegram/types';
import { BodyText, TitleText } from '@/components';

type GiftDetailsProps = {
  link: TgLink | null;
  webApp: WebApp;
};

export default function GiftDetails({ link, webApp }: GiftDetailsProps) {
  if (!link) {
    return;
  }

  return (
    <>
      <MainButton text="Send to contact" onClick={() => navigateTranferById(webApp, link)} />
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="text-text-hint mt-auto" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
}
