import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { TitleText, LinkCard } from '@/components';

export default function TransferPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      navigate(Paths.DASHBOARD);
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mt-6 mb-10">How to send tokens</TitleText>
      <LinkCard
        href={Paths.TRANSFER_SELECT_TOKEN}
        text="Send as Gift in Telegram"
        iconClassName="text-bg-icon-accent-primary"
        helpText="Transfer to one of your contacts"
        iconName="Gift"
        wrapperClassName="mb-2 py-1"
        showArrow
        onClick={() => setSelectedAsset({ isGift: true })}
      />
      <LinkCard
        href={Paths.TRANSFER_SELECT_TOKEN}
        text="Send to Address"
        helpText="Transfer to address within the network"
        iconName="Address"
        wrapperClassName="py-1"
        showArrow
        onClick={() => setSelectedAsset(null)}
      />
    </>
  );
}
