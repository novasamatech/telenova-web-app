import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { useBackButton } from '@/common/telegram/useBackButton.ts';
import { LinkCard, TitleText } from '@/components';

const Page: FC = () => {
  const navigate = useNavigate();
  const { setSelectedAsset } = useGlobalContext();
  const { addBackButton } = useBackButton();

  useEffect(() => {
    addBackButton(() => {
      navigate($path('/dashboard'));
    });
  }, []);

  //TODO: change text
  return (
    <>
      <TitleText className="mt-6 mb-10">How to send tokens</TitleText>
      <LinkCard
        href={$path('/exchange/select')}
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
        href={$path('/exchange/select')}
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
};

export default Page;
