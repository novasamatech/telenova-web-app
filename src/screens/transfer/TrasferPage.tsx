import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { LinkCard, TitleText } from '@/components';

export default function TransferPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      setSelectedAsset(null);
      navigate($path('/dashboard'));
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
        href={$path('/transfer/select-token')}
        text="Send as Gift in Telegram"
        textClassName="text-medium-title"
        iconClassName="text-bg-icon-accent-primary"
        helpText="Transfer to one of your contacts"
        iconName="Gift"
        wrapperClassName="mb-2 py-1"
        showArrow
        onClick={() => setSelectedAsset({ isGift: true })}
      />
      <LinkCard
        href={$path('/transfer/select-token')}
        text="Send to Address"
        textClassName="text-medium-title"
        helpText="Transfer to address within the network"
        iconName="Address"
        wrapperClassName="py-1"
        showArrow
        onClick={() => setSelectedAsset(null)}
      />
    </>
  );
}
