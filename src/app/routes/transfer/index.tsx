import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { LinkCard, TitleText } from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const { setSelectedAsset } = useGlobalContext();

  return (
    <>
      <BackButton
        onClick={() => {
          setSelectedAsset(null);
          navigate($path('/dashboard'));
        }}
      />
      <TitleText className="mt-6 mb-10">How to send tokens</TitleText>
      <LinkCard
        href={$path('/transfer/gift/token-select')}
        text="Send as Gift in Telegram"
        textClassName="text-medium-title"
        iconClassName="text-bg-icon-accent-primary"
        helpText="Transfer to one of your contacts"
        iconName="Gift"
        wrapperClassName="mb-2 py-1"
        showArrow
      />
      <LinkCard
        href={$path('/transfer/direct/token-select')}
        text="Send to Address"
        textClassName="text-medium-title"
        helpText="Transfer to address within the network"
        iconName="Address"
        wrapperClassName="py-1"
        showArrow
      />
    </>
  );
};

export default Page;
