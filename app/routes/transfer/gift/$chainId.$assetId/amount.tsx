import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { balancesModel } from '@/models/balances';
import { networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';
import { toFormattedBalance } from '@/shared/helpers';
import { HeadlineText, Icon } from '@/ui/atoms';
import { AmountDetails } from '@/ui/molecules';

export const clientLoader = (({ params }) => {
  return $params('/transfer/gift/:chainId/:assetId/amount', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const assets = useUnit(networkModel.$assets);
  const balances = useUnit(balancesModel.$balances);
  const prices = useUnit(pricesModel.$prices);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];
  const balance = balances[typedChainId]?.[selectedAsset!.assetId]?.balance;

  const {
    onMaxAmount,
    onAmountChange,
    setIsAmountValid,
    getIsAccountToBeReaped,
    isPending,
    deposit,
    amount,
    fee,
    maxAmount,
    isAmountValid,
    isTouched,
    isTransferAll,
  } = useAmountLogic({ chainId: typedChainId, asset: selectedAsset!, isGift: true, balance });

  const handleMaxGiftSend = () => {
    onMaxAmount();
    setIsAmountValid(!maxAmount.isZero() && maxAmount.gte(deposit));
  };

  const navigateToCreate = () => {
    const params = { chainId, assetId };
    const query = { amount: amount.toString(), fee: fee.toString(), all: isTransferAll };

    navigate($path('/transfer/gift/:chainId/:assetId/create', params, query));
  };

  const isAboveDeposit = amount.gte(deposit);

  if (!selectedAsset) return null;

  return (
    <>
      <MainButton
        text="Create gift"
        disabled={!isAmountValid || !isAboveDeposit || fee.isZero() || getIsAccountToBeReaped() || isPending}
        progress={isPending}
        onClick={navigateToCreate}
      />
      <BackButton onClick={() => navigate($path('/transfer/gift/token-select'))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Icon name="Gift" className="h-8 w-8 text-bg-icon-accent-primary" />
        <HeadlineText>Preparing Gift</HeadlineText>
        <Button variant="light" size="md" className="flex items-center gap-x-1 p-2" onClick={handleMaxGiftSend}>
          <HeadlineText className="flex items-center text-text-link">Max:</HeadlineText>
          {maxAmount.isZero() ? (
            <div className="w-[7ch] shrink-0">
              <Progress size="md" isIndeterminate />
            </div>
          ) : (
            <HeadlineText className="flex items-center text-text-link">
              {toFormattedBalance(maxAmount, selectedAsset.precision).formatted}
            </HeadlineText>
          )}
          <HeadlineText className="flex items-center text-text-link">{selectedAsset.symbol}</HeadlineText>
        </Button>
      </div>

      <AmountDetails
        asset={selectedAsset}
        amount={amount}
        prices={prices}
        isAmountValid={!isTouched || (isAmountValid && isAboveDeposit)}
        maxAmount={maxAmount}
        isPending={isPending}
        deposit={deposit}
        isAccountToBeReaped={getIsAccountToBeReaped()}
        onAmountChange={onAmountChange}
      >
        {isTouched && !isAboveDeposit && (
          <>
            Your gift should remain above the minimal
            <br />
            network deposit {toFormattedBalance(deposit, selectedAsset.precision).value} {selectedAsset.symbol}
          </>
        )}
      </AmountDetails>
    </>
  );
};

export default Page;
