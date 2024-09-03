import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { balancesModel } from '@/models/balances';
import { networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';
import { Address, HeadlineText, Identicon } from '@/ui/atoms';
import { AmountDetails } from '@/ui/molecules';

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
  const prices = useUnit(pricesModel.$prices);

  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];
  const balance = balances[typedChainId]?.[selectedAsset!.assetId]?.balance;

  const {
    onMaxAmount,
    onAmountChange,
    getIsAccountToBeReaped,
    isPending,
    isMaxPending,
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
        disabled={!isAmountValid || fee.isZero() || getIsAccountToBeReaped() || isPending}
        onClick={navigateToConfirm}
      />
      <BackButton onClick={() => navigate($path('/transfer/direct/:chainId/:assetId/address', { chainId, assetId }))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Identicon address={address} />
        <HeadlineText className="flex gap-1">
          Send to
          <Address address={address} className="max-w-[120px]" />
        </HeadlineText>
        <Button
          variant="light"
          size="md"
          className="flex items-center gap-x-1 p-2"
          isLoading={isMaxPending}
          onClick={onMaxAmount}
        >
          <HeadlineText className="flex items-center text-text-link">Use MAX</HeadlineText>
        </Button>
      </div>
      <AmountDetails
        asset={selectedAsset}
        amount={amount}
        prices={prices}
        maxAmount={maxAmount}
        deposit={deposit}
        isPending={isPending}
        isAmountValid={!isTouched || isAmountValid}
        isAccountToBeReaped={getIsAccountToBeReaped()}
        onAmountChange={onAmountChange}
      />
    </>
  );
};

export default Page;
