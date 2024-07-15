import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { pickAsset } from '@/common/utils';
import { AmountDetails, HeadlineText, Icon } from '@/components';

export const clientLoader = (({ params }) => {
  return $params('/transfer/gift/:chainId/:assetId/amount', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const { assets } = useGlobalContext();
  const navigate = useNavigate();

  const selectedAsset = pickAsset(chainId, assetId, assets);

  const {
    handleMaxSend,
    handleChange,
    setIsAmountValid,
    getIsAccountToBeReaped,
    isPending,
    deposit,
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
    touched,
    transferAll,
  } = useAmountLogic({ selectedAsset, isGift: true });

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  const navigateToCreate = () => {
    const params = { chainId, assetId };
    const query = { amount, fee: (fee || '0').toString(), all: transferAll };

    navigate($path('/transfer/gift/:chainId/:assetId/create', params, query));
  };

  const isAboveDeposit = Boolean(deposit) && +amount >= deposit;

  return (
    <>
      <MainButton
        text="Create gift"
        disabled={!isAmountValid || !isAboveDeposit || !Number(fee) || getIsAccountToBeReaped() || isPending}
        progress={isPending}
        onClick={navigateToCreate}
      />
      <BackButton onClick={() => navigate($path('/transfer/gift/token-select'))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Icon name="Gift" className="w-8 h-8 text-bg-icon-accent-primary" />
        <HeadlineText>Preparing Gift</HeadlineText>
        <Button variant="light" size="md" className="flex items-center gap-x-1 p-2" onClick={handleMaxGiftSend}>
          <HeadlineText className="flex items-center text-text-link">Max:</HeadlineText>
          {maxAmountToSend ? (
            <HeadlineText className="flex items-center text-text-link">{maxAmountToSend}</HeadlineText>
          ) : (
            <div className="shrink-0 w-[7ch]">
              <Progress size="md" isIndeterminate />
            </div>
          )}
          <HeadlineText className="flex items-center text-text-link">{selectedAsset?.asset?.symbol}</HeadlineText>
        </Button>
      </div>

      <AmountDetails
        selectedAsset={selectedAsset}
        amount={amount}
        isAmountValid={!touched || (isAmountValid && isAboveDeposit)}
        maxAmountToSend={maxAmountToSend}
        isPending={isPending}
        deposit={deposit}
        isAccountToBeReaped={getIsAccountToBeReaped()}
        handleChange={handleChange}
      >
        {touched && !isAboveDeposit && (
          <>
            Your gift should remain above the minimal
            <br />
            network deposit {deposit} {selectedAsset?.asset?.symbol}
          </>
        )}
      </AmountDetails>
    </>
  );
};

export default Page;
