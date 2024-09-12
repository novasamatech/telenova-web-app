import { type WebApp } from '@twa-dev/types';
import { $path } from 'remix-routes';

import { telegramShareLink } from '@/common/telegram';
import { MainButton } from '@/common/telegram/MainButton';
import { type TgLink } from '@/common/telegram/types';
import { navigationModel } from '@/models/navigation';
import { BodyText, TitleText } from '@/ui/atoms';

type Props = {
  link: TgLink;
  webApp: WebApp;
};

export const GiftDetails = ({ link, webApp }: Props) => {
  const shareGiftLink = () => {
    telegramShareLink(webApp, link, () => {
      navigationModel.input.navigatorPushed({
        type: 'navigate',
        to: $path('/dashboard'),
        options: { replace: true },
      });
    });
  };

  return (
    <>
      <MainButton text="Send to contact" onClick={shareGiftLink} />
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="mt-auto text-text-hint" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
};
