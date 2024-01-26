import { Button, Snippet } from '@nextui-org/react';
import { WebApp } from '@twa-dev/types';

import { BodyText } from '@/components';
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
      <Snippet color="primary" hideSymbol size="sm" classNames={{ pre: ['text-wrap w-[300px] overflow-auto'] }}>
        {link.url}
      </Snippet>
      <BodyText className="text-text-hint" align="center">
        Now you can send this link anyone who you needed to claim funds. When they will open it, the gift will marked as
        claimed
      </BodyText>
      <Button color="primary" onClick={() => navigateTranferById(webApp, link)}>
        Share with your contact
      </Button>
    </>
  );
}
