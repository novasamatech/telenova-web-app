import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';

import { Button, Progress } from '@nextui-org/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic.tsx';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { pickAsset } from '@/common/utils';
import { BodyText, HeadlineText, Icon } from '@/components';
import { AmountDetails } from '@/components/AmountDetails.tsx';

export const clientLoader = (({ params }) => {
  return $params('/transfer/gift/:chainId/:assetId/amount', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();
  const { mainButton, addMainButton, hideMainButton, reset } = useMainButton();
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
    onAmountChange: () => {
      mainButton.setText('Create gift');
      setIsAmountValid(prev => prev && !!deposit && +amount >= deposit);
    },
  });

  const handleMaxGiftSend = () => {
    handleMaxSend();
    setIsAmountValid(Boolean(maxAmountToSend) && +maxAmountToSend >= deposit);
  };

  useEffect(() => {
    mainButton.setText('Continue');
    mainButton.show();
    mainButton.disable();

    return hideMainButton;
  }, []);

  useEffect(() => {
    if (!isAmountValid || !Number(fee) || isAccountTerminate || isPending) {
      mainButton.disable();

      return;
    }

    mainButton.enable();
    addMainButton(() => {
      navigate(
        $path('/transfer/gift/:chainId/:assetId/:amount/create', {
          chainId,
          assetId,
          amount,
        }),
      );
    }, 'Create gift');

    return reset;
  }, [fee, isAmountValid, maxAmountToSend, isPending, isAccountTerminate]);

  return (
    <>
      <BackButton onClick={() => navigate($path('/transfer/gift/token-select'))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Icon name="Gift" className="w-8 h-8 text-bg-icon-accent-primary" />
        <HeadlineText>Preparing Gift</HeadlineText>
        <Button variant="light" size="md" className="p-2" onClick={handleMaxGiftSend}>
          <HeadlineText className="flex items-center text-text-link">
            Max:{' '}
            {maxAmountToSend || (
              <div className="shrink-0 w-[7ch]">
                <Progress size="md" isIndeterminate />
              </div>
            )}{' '}
            {selectedAsset?.asset?.symbol}
          </HeadlineText>
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
