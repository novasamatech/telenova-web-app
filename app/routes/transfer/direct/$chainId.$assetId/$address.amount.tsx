import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic.ts';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { pickAsset } from '@/common/utils';
import { HeadlineText, Identicon, TruncateAddress } from '@/components';
import { AmountDetails } from '@/components/AmountDetails';

// Query params for /transfer/direct/:chainId/:assetId/amount?amount=__value__
export type SearchParams = {
  amount: string;
};

export const clientLoader = (({ params, request }) => {
  const url = new URL(request.url);
  const amount = url.searchParams.get('amount') || '';
  const data = $params('/transfer/direct/:chainId/:assetId/:address/amount', params);

  return { amount, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId, address, amount: transferAmount } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { assets } = useGlobalContext();

  const selectedAsset = pickAsset(chainId, assetId, assets);

  const {
    handleMaxSend,
    handleChange,
    getIsAccountToBeReaped,
    isPending,
    deposit,
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({ selectedAsset });

  // Set amount from query params (/exchange/widget Mercurio page does this)
  useEffect(() => {
    if (!transferAmount) return;

    handleChange(transferAmount);
  }, [transferAmount]);

  const navigateToConfirm = () => {
    if (!selectedAsset) return;

    const params = { chainId, assetId, address };
    const query = { amount, fee: (fee || '0').toString() };

    navigate($path('/transfer/direct/:chainId/:assetId/:address/confirmation', params, query));
  };

  return (
    <>
      <MainButton
        disabled={!isAmountValid || !Number(fee) || getIsAccountToBeReaped() || isPending}
        onClick={navigateToConfirm}
      />
      <BackButton onClick={() => navigate($path('/transfer/direct/:chainId/:assetId/address', { chainId, assetId }))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Identicon address={address} />
        <HeadlineText className="flex gap-1">
          Send to
          <TruncateAddress address={address} className="max-w-[120px]" />
        </HeadlineText>
        <Button variant="light" size="md" className="flex items-center gap-x-1 p-2" onClick={handleMaxSend}>
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
        isAccountTerminate={getIsAccountToBeReaped()}
        handleChange={handleChange}
      />
    </>
  );
};

export default Page;
