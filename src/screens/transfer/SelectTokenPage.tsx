import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { AssetBalance, TitleText } from '@/components';

export default function SelectTokenPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets, setSelectedAsset, selectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      navigate($path('/transfer'));
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mt-6 mb-10">Select a token to send</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {assets.map(asset => (
          <Link
            to={selectedAsset?.isGift ? $path('/transfer/amount-gift') : $path('/transfer/address')}
            key={asset.chainId}
            onClick={() => setSelectedAsset(prev => (prev ? { isGift: prev.isGift, ...asset } : asset))}
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
}
