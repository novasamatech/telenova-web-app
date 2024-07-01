import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { pickAsset } from '@/common/utils';
import { HeadlineText, Identicon, TruncateAddress } from '@/components';
import { AmountDetails } from '@/components/AmountDetails';

export type SearchParams = {
  amount: string;
};

export const clientLoader = (({ params, request }) => {
  const url = new URL(request.url);

  return {
    amount: url.searchParams.get('amount') || '0',
    ...$params('/transfer/direct/:chainId/:assetId/:address/amount', params),
  };
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const navigate = useNavigate();
  const { assets } = useGlobalContext();
  const { chainId, assetId, address, amount: transferAmount } = useLoaderData<typeof clientLoader>();

  const selectedAsset = pickAsset(chainId, assetId, assets);

  const {
    handleMaxSend,
    handleChange,
    isAccountTerminate,
    isPending,
    deposit,
    amount,
    fee,
    maxAmountToSend,
    isAmountValid,
  } = useAmountLogic({ selectedAsset });

  // Set amount from query params (Mercurio page does this)
  useEffect(() => {
    handleChange(transferAmount);
  }, [transferAmount]);

  return (
    <>
      <MainButton
        disabled={!isAmountValid || !Number(fee) || isAccountTerminate || isPending}
        onClick={() => {
          navigate(
            $path('/transfer/direct/:chainId/:assetId/:address/:amount/confirmation', {
              chainId,
              assetId,
              address,
              amount,
            }),
          );
        }}
      />
      <BackButton onClick={() => navigate($path('/transfer/direct/:chainId/:assetId/address', { chainId, assetId }))} />
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Identicon address={address} />
        <HeadlineText className="flex gap-1">
          Send to
          <TruncateAddress address={address} className="max-w-[120px]" />
        </HeadlineText>
        <Button variant="light" size="md" className="p-2" onClick={handleMaxSend}>
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
      />
    </>
  );
};

export default Page;
