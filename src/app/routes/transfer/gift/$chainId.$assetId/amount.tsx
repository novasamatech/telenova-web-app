import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { pickAsset } from '@/common/utils';
import { BodyText, HeadlineText, Icon } from '@/components';
import { AmountDetails } from '@/components/AmountDetails';

export const clientLoader = (({ params }) => {
  return $params('/transfer/gift/:chainId/:assetId/amount', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();
  const { assets } = useGlobalContext();
  const navigate = useNavigate();
  const selectedAsset = pickAsset({ chainId, assetId, assets });

  const {
    handleMaxSend,
    handleChange,
    setIsAmountValid,
    isAccountTerminate,
    isPending,
    deposit,
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({
    selectedAsset,
    // onAmountChange: () => {
    //   setIsAmountValid(prev => prev && !!deposit && +amount >= deposit);
    // },
  });

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  return (
    <>
      <MainButton
        text="Create gift"
        disabled={!isAmountValid || !Number(fee) || isAccountTerminate}
        progress={isPending}
        onClick={() => {
          navigate(
            $path('/transfer/gift/:chainId/:assetId/:amount/create', {
              chainId,
              assetId,
              amount,
            }),
          );
        }}
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
        isAmountValid={isAmountValid}
        maxAmountToSend={maxAmountToSend}
        isPending={isPending}
        deposit={deposit}
        isAccountTerminate={isAccountTerminate}
        handleChange={handleChange}
      >
        {!!deposit && +amount < deposit && (
          <BodyText as="span" className="text-text-danger">
            Your gift should remain above the minimal network deposit {deposit} {selectedAsset?.asset?.symbol}
          </BodyText>
        )}
      </AmountDetails>
    </>
  );
};

export default Page;
