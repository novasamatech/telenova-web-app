import { Button } from '@nextui-org/react';
import { WebApp } from '@twa-dev/types';

import { BodyText, TitleText } from '@/components';
import { navigateTranferById } from '@/common/telegram';
import { TgLink } from '@/common/telegram/types';

type GiftDetailsProps = {
  link: TgLink | null;
  webApp: WebApp;
};

export default function GiftDetails({ link, webApp }: GiftDetailsProps) {
  if (!link) return;

  return (
    <>
      <TitleText>The gift has been prepared!</TitleText>
      <BodyText className="text-text-hint mb-4" align="center">
        Send the link to anyone or share it directly to your Telegram contact. Don’t worry If you accidentally close
        this window, your prepared gift will be waiting for you on the Main Screen
      </BodyText>
      <Button color="primary" className="rounded-full w-[200px]" onClick={() => navigateTranferById(webApp, link)}>
        Share with contact
      </Button>
    </>
  );
}
