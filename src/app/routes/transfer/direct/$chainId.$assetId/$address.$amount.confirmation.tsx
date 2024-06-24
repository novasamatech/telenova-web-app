import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';

import { Divider } from '@nextui-org/react';
import { $params, $path } from 'remix-routes';

import { useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { type ChainId } from '@/common/types';
import { formatAmount, formatBalance, pickAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks';
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

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/:address/:amount/confirmation', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId, amount, address } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { sendTransaction } = useExtrinsic();
  const { getAssetHubFee } = useAssetHub();
  const { assets } = useGlobalContext();

  const [fee, setFee] = useState<number>(0);

  const selectedAsset = pickAsset({ assets, chainId, assetId });

  useEffect(() => {
    getAssetHubFee(chainId as ChainId, assetId, amount, address).then(setFee);
  }, []);

  const mainCallback = () => {
    if (!selectedAsset) {
      return;
    }

    sendTransaction({
      destinationAddress: address,
      chainId: chainId as ChainId,
      transferAll: false,
      transferAmount: formatAmount(amount, selectedAsset.asset!.precision),
      asset: selectedAsset.asset,
    })
      .then(() => {
        navigate(
          $path('/transfer/direct/:chainId/:assetId/:address/:amount/result', { chainId, assetId, amount, address }),
        );
      })
      .catch(error => alert(`Error: ${error.message}\nTry to relaod`));
  };

  const symbol = selectedAsset?.asset?.symbol;
  const calculatedFee = formatBalance(fee.toString(), selectedAsset?.asset?.precision)?.formattedValue;
  const details = [
    {
      title: 'Recipients address',
      value: address,
    },
    {
      title: 'Fee',
      value: `${calculatedFee} ${symbol}`,
    },
    {
      title: 'Total amount',
      value: `${(Number(amount) + fee).toFixed(5)} ${symbol}`,
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
