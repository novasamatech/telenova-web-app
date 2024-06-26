import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { AssetBalance, TitleText } from '@/components';

export default function ReceiveTokenPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      setSelectedAsset(null);
      navigate($path('/dashboard'));
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mt-6 mb-10">Select a token to receive</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {assets.map(asset => (
          <Link to={$path('/receive')} key={asset.chainId} onClick={() => setSelectedAsset(asset)}>
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
