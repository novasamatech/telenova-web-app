import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { BodyText, HeadlineText, Icon } from '@/components';
import { AmountDetails } from '@/components/AmountDetails';
import { balancesModel, networkModel } from '@/models';

export const clientLoader = (({ params }) => {
  return $params('/transfer/gift/:chainId/:assetId/amount', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const assets = useUnit(networkModel.$assets);
  const balances = useUnit(balancesModel.$balances);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];
  const balance = balances[typedChainId]?.[selectedAsset!.assetId]?.balance;

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
  } = useAmountLogic({ chainId: typedChainId, asset: selectedAsset!, isGift: true, balance });

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  const navigateToCreate = () => {
    const params = { chainId, assetId };
    const query = { amount, fee: (fee || '0').toString() };

    navigate($path('/transfer/gift/:chainId/:assetId/create', params, query));
  };

  const isAboveDeposit = Boolean(deposit) && +amount >= deposit;

  if (!selectedAsset) return null;

  return (
    <>
      <MainButton
        text="Create gift"
        disabled={!isAmountValid || !isAboveDeposit || !Number(fee) || getIsAccountToBeReaped()}
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
          <HeadlineText className="flex items-center text-text-link">{selectedAsset.symbol}</HeadlineText>
        </Button>
      </div>

      <AmountDetails
        asset={selectedAsset}
        amount={amount}
        isAmountValid={!touched || (isAmountValid && isAboveDeposit)}
        maxAmountToSend={maxAmountToSend}
        isPending={isPending}
        deposit={deposit}
        isAccountTerminate={getIsAccountToBeReaped()}
        handleChange={handleChange}
      >
        {touched && !isAboveDeposit && (
          <BodyText as="span" className="text-text-danger">
            Your gift should remain above the minimal network deposit {deposit} {selectedAsset.symbol}
          </BodyText>
        )}
      </AmountDetails>
    </>
  );
};

export default Page;
