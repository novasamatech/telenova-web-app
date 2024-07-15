import { useNavigate } from 'react-router-dom';

import { Divider } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { type ChainId } from '@/common/types';
import { formatAmount, formatBalance, pickAsset } from '@/common/utils';
import {
  BodyText,
  HeadlineText,
  Icon,
  Identicon,
  LargeTitleText,
  MediumTitle,
  Plate,
  TruncateAddress,
} from '@/components';
import type { IconNames } from '@/components/Icon/types.ts';

// Query params for /transfer/direct/:chainId/:assetId/confirmation?amount=_&fee=_&all=_
export type SearchParams = {
  amount: string;
  fee: string;
  all: boolean;
};

export const clientLoader = (({ params, request }) => {
  const url = new URL(request.url);

  return {
    ...$params('/transfer/direct/:chainId/:assetId/:address/confirmation', params),
    amount: url.searchParams.get('amount') || '0',
    fee: url.searchParams.get('fee') || '0',
    all: url.searchParams.get('all') === 'true',
  };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId, address, amount, fee, all } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { sendTransfer } = useExtrinsic();
  const { assets } = useGlobalContext();

  const selectedAsset = pickAsset(chainId, assetId, assets);

  const mainCallback = () => {
    if (!selectedAsset) return;

    sendTransfer({
      destinationAddress: address,
      chainId: chainId as ChainId,
      transferAll: all,
      transferAmount: formatAmount(amount, selectedAsset.asset!.precision),
      asset: selectedAsset.asset,
    })
      .then(() => {
        const params = { chainId, assetId, address };
        const query = { amount };

        navigate($path('/transfer/direct/:chainId/:assetId/:address/result', params, query));
      })
      .catch(error => alert(`Error: ${error.message}\nTry to reload`));
  };

  const symbol = selectedAsset?.asset?.symbol;
  const formattedFee = formatBalance(fee, selectedAsset?.asset?.precision);
  const formattedTotal = (Number(amount) + Number(formattedFee.formattedValue)).toFixed(5);

  const details = [
    {
      title: 'Recipients address',
      value: address,
    },
    {
      title: 'Fee',
      value: `${formattedFee.formattedValue} ${symbol}`,
    },
    {
      title: 'Total amount',
      value: `${formattedTotal} ${symbol}`,
    },
    {
      title: 'Network',
      value: selectedAsset?.chainName,
    },
  ];

  return (
    <>
      <MainButton text="Confirm" onClick={mainCallback} />
      <BackButton
        onClick={() =>
          navigate($path('/transfer/direct/:chainId/:assetId/:address/amount', { chainId, assetId, address }))
        }
      />
      <div className="grid grid-cols-[40px,1fr] items-center">
        <Identicon address={address} />
        <HeadlineText className="flex gap-1">
          Send to
          <TruncateAddress address={address} className="max-w-[130px]" />
        </HeadlineText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <Icon name={symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{symbol}</LargeTitleText>
        <LargeTitleText>{amount}</LargeTitleText>
      </div>
      <Plate className="w-full pr-0">
        {details.map(({ title, value }, index) => (
          <div key={title}>
            {index !== 0 && <Divider className="my-4 h-[0.5px] w-auto" />}
            <div className="grid gap-2 break-all pr-4">
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              <MediumTitle>{value}</MediumTitle>
            </div>
          </div>
        ))}
      </Plate>
    </>
  );
};

export default Page;
