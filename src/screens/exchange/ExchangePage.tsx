import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { TitleText, LinkCard } from '@/components';

export default function ExchangePage() {
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

  //TODO: change text
  return (
    <>
      <TitleText className="mt-6 mb-10">How to send tokens</TitleText>
      <LinkCard
        href={Paths.EXCHANGE_SELECT}
        text="Buy Crypto"
        textClassName="text-medium-title"
        iconClassName="text-bg-icon-accent-primary"
        helpText="Bank card, Google Pay, SEPA, PIX"
        iconName="Buy"
        wrapperClassName="mb-2 py-1"
        showArrow
        onClick={() => setSelectedAsset({ operationType: 'buy' })}
      />
      <LinkCard
        href={Paths.EXCHANGE_SELECT}
        text="Sell Crypto"
        textClassName="text-medium-title"
        helpText="Bank card"
        iconName="Sell"
        wrapperClassName="py-1"
        showArrow
        onClick={() => setSelectedAsset({ operationType: 'sell' })}
      />
    </>
  );
}
