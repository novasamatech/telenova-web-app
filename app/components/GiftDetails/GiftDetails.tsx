import { type WebApp } from '@twa-dev/types';

import { navigateTransferById } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton';
import { type TgLink } from '@/common/telegram/types';
import { BodyText, TitleText } from '@/components';

type Props = {
  link: TgLink;
  webApp: WebApp;
};

const GiftDetails = ({ link, webApp }: Props) => {
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

export default GiftDetails;
