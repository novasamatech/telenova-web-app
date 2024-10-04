import { useEffect } from 'react';

import { $path } from 'remix-routes';

import { navigationModel } from '@/models/navigation';
import { BackButton } from '@/shared/api';
import { TitleText } from '@/ui/atoms';
import { LinkCard } from '@/ui/molecules';

const Page = () => {
  useEffect(() => {
    if (document.getElementById('mercuryo_widget')) return;

    const script = document.createElement('script');
    script.id = 'mercuryo_widget';
    script.src = 'https://widget.mercuryo.io/embed.2.1.js';

    document.body.appendChild(script);
  }, []);

  return (
    <>
      <BackButton
        onClick={() => navigationModel.input.navigatorPushed({ type: 'navigate', to: $path('/dashboard') })}
      />
      <TitleText className="mb-10 mt-6">How to send tokens</TitleText>
      <LinkCard
        href={$path('/exchange/select', { type: 'buy' })}
        text="Buy Crypto"
        textClassName="text-medium-title"
        iconClassName="text-bg-icon-accent-primary"
        helpText="Bank card, Google Pay, SEPA, PIX"
        iconName="Buy"
        wrapperClassName="mb-2 py-1"
        showArrow
      />
      <LinkCard
        href={$path('/exchange/select', { type: 'sell' })}
        text="Sell Crypto"
        textClassName="text-medium-title"
        helpText="Bank card"
        iconName="Sell"
        wrapperClassName="py-1"
        showArrow
      />
    </>
  );
};

export default Page;
