import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { AmountDetails, HeadlineText, Identicon, TruncateAddress } from '@/components';
import { balancesModel, networkModel } from '@/models';

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

  const typedChainId = chainId as ChainId;
  const assets = useUnit(networkModel.$assets);
  const balances = useUnit(balancesModel.$balances);

  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];
  const balance = balances[typedChainId]?.[selectedAsset!.assetId]?.balance;

  const {
    onMaxAmount,
    onAmountChange,
    getIsAccountToBeReaped,
    isPending,
    deposit,
    amount,
    fee,
    maxAmount,
    isAmountValid,
    isTouched,
    isTransferAll,
  } = useAmountLogic({
    chainId: typedChainId,
    asset: selectedAsset!,
    isGift: false,
    balance,
  });

  // Set amount from query params (/exchange/widget Mercurio page does this)
  useEffect(() => {
    if (!transferAmount) return;

    onAmountChange(transferAmount);
  }, [transferAmount]);

  const navigateToConfirm = () => {
    if (!selectedAsset) return;

    const params = { chainId, assetId, address };
    const query = { amount: amount.toString(), fee: fee.toString(), all: isTransferAll };

    navigate($path('/transfer/direct/:chainId/:assetId/:address/confirmation', params, query));
  };

  if (!selectedAsset) return null;

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
        <Button variant="light" size="md" className="flex items-center gap-x-1 p-2" onClick={onMaxAmount}>
          <HeadlineText className="flex items-center text-text-link">Max:</HeadlineText>
          {maxAmount ? (
            <HeadlineText className="flex items-center text-text-link">{maxAmount.toString()}</HeadlineText>
          ) : (
            <div className="shrink-0 w-[7ch]">
              <Progress size="md" isIndeterminate />
            </div>
          )}
          <HeadlineText className="flex items-center text-text-link">{selectedAsset.symbol}</HeadlineText>
        </Button>
      </div>
      <AmountDetails
        asset={selectedAsset}
        amount={amount}
        maxAmount={maxAmount}
        deposit={deposit}
        isPending={isPending}
        isAmountValid={!isTouched || isAmountValid}
        isAccountToBeReaped={getIsAccountToBeReaped()}
        handleChange={onAmountChange}
      />
    </>
  );
};

export default Page;
