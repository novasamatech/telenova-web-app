import { type WebApp } from '@twa-dev/types';

import { navigateTransferById } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { type TgLink } from '@/common/telegram/types';
import { BodyText, TitleText } from '@/ui/atoms';

type Props = {
  link: TgLink;
  webApp: WebApp;
};

export const GiftDetails = ({ link, webApp }: Props) => {
  return (
    <>
      <MainButton text="Send to contact" onClick={() => navigateTransferById(webApp, link)} />
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="mt-auto text-text-hint" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
};
