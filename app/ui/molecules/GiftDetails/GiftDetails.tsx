import { $path } from 'remix-routes';

import { navigationModel } from '@/models/navigation';
import { MainButton, TelegramApi } from '@/shared/api';
import { type TelegramLink } from '@/shared/api/telegram/types';
import { BodyText, TitleText } from '@/ui/atoms';

type Props = {
  link: TelegramLink;
};

export const GiftDetails = ({ link }: Props) => {
  const shareGiftLink = () => {
    TelegramApi.shareLink(link, () => {
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
