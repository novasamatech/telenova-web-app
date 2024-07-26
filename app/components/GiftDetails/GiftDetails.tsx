import { type WebApp } from '@twa-dev/types';

import { BodyText, TitleText } from '../Typography';

import { navigateTransferById } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton';
import { type TgLink } from '@/common/telegram/types';

type Props = {
  link: TgLink;
  webApp: WebApp;
};

export const GiftDetails = ({ link, webApp }: Props) => {
  return (
    <>
      <MainButton text="Send to contact" onClick={() => navigateTransferById(webApp, link)} />
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="text-text-hint mt-auto" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
};
