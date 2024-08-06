import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { toShortAddress } from '../../../../shared/helpers';

import { MainButton } from '@/common/telegram/MainButton';
import { Icon, Identicon, MediumTitle, TitleText } from '@/components';
import { networkModel } from '@/models';

export type SearchParams = {
  amount: string;
};

export const clientLoader = (({ params, request }) => {
  const url = new URL(request.url);
  const amount = url.searchParams.get('amount') || '';
  const data = $params('/transfer/direct/:chainId/:assetId/:address/result', params);

  return { amount, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { address, amount, assetId, chainId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const assets = useUnit(networkModel.$assets);

  const selectedAsset = assets[chainId as ChainId]?.[Number(assetId) as AssetId];

  if (!selectedAsset) return null;

  return (
    <>
      <MainButton text="Done" onClick={() => navigate($path('/dashboard'), { replace: true })} />
      <div className="flex flex-col items-center justify-center h-[95vh] gap-3">
        <Icon name="Success" size={250} />
        <TitleText>
          {amount} {selectedAsset.symbol} Sent to
        </TitleText>
        <div className="flex gap-x-1 items-center">
          <Identicon address={address} />
          <MediumTitle className="text-text-hint">{toShortAddress(address, 15)}</MediumTitle>
        </div>
        <MediumTitle className="text-text-hint" align="center">
          Your transaction has been sent to the network and will be processed in a few seconds.
        </MediumTitle>
      </div>
    </>
  );
};

export default Page;
