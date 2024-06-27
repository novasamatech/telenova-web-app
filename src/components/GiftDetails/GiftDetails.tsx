import { useEffect } from 'react';

import { type WebApp } from '@twa-dev/types';

import { navigateTranferById } from '@/common/telegram';
import { type TgLink } from '@/common/telegram/types';
import { useMainButton } from '@/common/telegram/useMainButton';
import { BodyText, TitleText } from '@/components';

type Props = {
  link: TgLink;
  webApp: WebApp;
};

const GiftDetails = ({ link, webApp }: Props) => {
  const { addMainButton } = useMainButton();

  useEffect(() => {
    addMainButton(() => navigateTranferById(webApp, link), 'Send to contact');
  }, []);

  return (
    <>
      <TitleText className="mb-auto">The gift has been prepared!</TitleText>
      <BodyText className="text-text-hint mt-auto" align="center">
        Your gifts can be managed on Main screen
      </BodyText>
    </>
  );
};

export default GiftDetails;
