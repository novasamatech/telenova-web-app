import { useNavigate } from 'react-router-dom';

import { Divider } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { BN } from '@polkadot/util';

import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { networkModel } from '@/models/network';
import { telegramModel } from '@/models/telegram';
import { keyringApi, transferFactory } from '@/shared/api';
import { toFormattedBalance, toShortAddress } from '@/shared/helpers';
import { Address, AssetIcon, BodyText, HeadlineText, Identicon, LargeTitleText, MediumTitle, Plate } from '@/ui/atoms';

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

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);
  const connections = useUnit(networkModel.$connections);
  const webApp = useUnit(telegramModel.$webApp);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  if (!webApp || !selectedAsset || !chains[typedChainId]) return null;

  const symbol = selectedAsset.symbol;
  const bnFee = new BN(fee);
  const bnAmount = new BN(amount);
  const formattedFee = toFormattedBalance(bnFee, selectedAsset.precision);
  const formattedTotal = toFormattedBalance(bnAmount.add(bnFee), selectedAsset.precision);

  const mainCallback = () => {
    const keyringPair = keyringApi.getKeyringPair(webApp, chains[typedChainId]);
    if (!keyringPair) return;

    transferFactory
      .createService(connections[typedChainId].api!, selectedAsset)
      .sendTransfer({
        keyringPair,
        amount: bnAmount,
        destination: address,
        transferAll: all,
      })
      .then(() => {
        const params = { chainId, assetId, address };
        const query = { amount };

        navigate($path('/transfer/direct/:chainId/:assetId/:address/result', params, query));
      })
      .catch(error => alert(`Error: ${error.message}\nTry to reload`));
  };

  const details = [
    {
      title: 'Recipients address',
      value: (
        <div className="flex items-center gap-x-1">
          <Identicon address={address} className="flex-shrink-0" />
          <MediumTitle>{toShortAddress(address, 15)}</MediumTitle>
        </div>
      ),
    },
    {
      title: 'Fee',
      value: <MediumTitle>{`${formattedFee.formatted} ${symbol}`}</MediumTitle>,
    },
    {
      title: 'Total amount',
      value: <MediumTitle>{`${formattedTotal.formatted} ${symbol}`}</MediumTitle>,
    },
    {
      title: 'Network',
      value: <MediumTitle>{chains[typedChainId].name}</MediumTitle>,
    },
  ];

  const navigateBack = () => {
    navigate($path('/transfer/direct/:chainId/:assetId/:address/amount', { chainId, assetId, address }));
  };

  return (
    <>
      <MainButton text="Confirm" onClick={mainCallback} />
      <BackButton onClick={navigateBack} />
      <div className="grid grid-cols-[40px,1fr] items-center">
        <Identicon address={address} />
        <HeadlineText className="flex gap-1">
          Send to
          <Address address={address} className="max-w-[130px]" />
        </HeadlineText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <AssetIcon src={selectedAsset.icon} size={46} />
        <LargeTitleText>{symbol}</LargeTitleText>
        <LargeTitleText>{toFormattedBalance(amount, selectedAsset.precision).formatted}</LargeTitleText>
      </div>
      <Plate className="w-full pr-0">
        {details.map(({ title, value }, index) => (
          <div key={title}>
            {index !== 0 && <Divider className="my-4 h-[0.5px] w-auto" />}
            <div className="grid gap-2 break-all pr-4">
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              {value}
            </div>
          </div>
        ))}
      </Plate>
    </>
  );
};

export default Page;
