import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { balancesModel } from '@/models/balances';
import { networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';
import { BackButton, MainButton, balancesFactory, transferFactory } from '@/shared/api';
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
  const connections = useUnit(networkModel.$connections);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];
  const balance = balances[typedChainId]?.[selectedAsset!.assetId]?.balance;

  const {
    onMaxAmount,
    onAmountChange,
    setIsAmountValid,
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
    services: {
      balanceService: balancesFactory.createService(typedChainId, connections[typedChainId].client!, selectedAsset),
      transferService: transferFactory.createService(connections[typedChainId].client!, selectedAsset),
    },
    asset: selectedAsset!,
    isGift: true,
    balance,
  });

  const handleMaxGiftSend = () => {
    onMaxAmount();
    setIsAmountValid(!maxAmount.isZero() && maxAmount.gte(deposit));
  };

  const navigateToCreate = () => {
    const params = { chainId, assetId };
    const query = {
      amount: amount.add(fee.divn(2)).toString(),
      gift: amount.toString(),
      all: isTransferAll,
    };

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
        <Button
          variant="light"
          size="md"
          className="flex items-center gap-x-1 p-2"
          isLoading={isMaxPending}
          onClick={handleMaxGiftSend}
        >
          <HeadlineText className="flex items-center text-text-link">Use MAX</HeadlineText>
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
