import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { networkModel } from '@/models/network';
import { isEvmChain, toFormattedBalance, toShortAddress } from '@/shared/helpers';
import { Icon, Identicon, MediumTitle, TitleText } from '@/ui/atoms';

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

  const [assets, chains] = useUnit([networkModel.$assets, networkModel.$chains]);

  const selectedAsset = assets[chainId as ChainId]?.[Number(assetId) as AssetId];

  if (!selectedAsset) return null;

  return (
    <>
      <MainButton text="Done" onClick={() => navigate($path('/dashboard'), { replace: true })} />
      <div className="flex h-[95vh] flex-col items-center justify-center gap-3">
        <Icon name="Success" size={250} />
        <TitleText>
          {toFormattedBalance(amount, selectedAsset.precision).formatted} {selectedAsset.symbol} Sent to
        </TitleText>
        <div className="flex items-center gap-x-1">
          <Identicon
            className="flex-shrink-0"
            address={address}
            theme={isEvmChain(chains[chainId as ChainId]) ? 'ethereum' : 'polkadot'}
          />
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
