import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Progress } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useAmountLogic } from '@/common/_temp_hooks/useAmountLogic.tsx';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { pickAsset } from '@/common/utils';
import { HeadlineText, Identicon, TruncateAddress } from '@/components';
import { AmountDetails } from '@/components/AmountDetails.tsx';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/:address/amount', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId, address } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const { assets } = useGlobalContext();
  const selectedAsset = pickAsset({ assets, chainId, assetId });

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
