import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { AssetBalance, TitleText } from '@/components';

const skippedBuyAssets = ['WND', 'USDT'];

const Page = () => {
  const navigate = useNavigate();
  const { assets, selectedAsset, setSelectedAsset } = useGlobalContext();

  const exchangeAssets = assets.filter(i => !skippedBuyAssets.includes(i.asset.symbol));

  return (
    <>
      <BackButton onClick={() => navigate($path('/exchange'))} />
      <TitleText className="mt-6 mb-10">Select a token to {selectedAsset?.operationType}</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {exchangeAssets.map(asset => (
          <Link
            to={$path('/exchange/widget')}
            key={asset.chainId}
            onClick={() => setSelectedAsset(prev => ({ operationType: prev?.operationType, ...asset }))}
          >
            <AssetBalance
              asset={asset.asset}
              balance={asset.totalBalance}
              className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              name={asset.chainName}
              showArrow
            />
          </Link>
        ))}
      </div>
    </>
  );
};

export default Page;
