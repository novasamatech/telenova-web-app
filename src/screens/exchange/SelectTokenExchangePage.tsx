import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useTelegram, useGlobalContext } from '@common/providers';
import { Paths } from '@/common/routing';
import { TitleText, AssetBalance } from '@/components';

const skippedBuyAssets = ['WND', 'USDT'];

export default function SelectTokenExchangePage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets, selectedAsset, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      navigate(Paths.EXCHANGE);
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  const exchangeAssets = assets.filter((i) => !skippedBuyAssets.includes(i.asset.symbol));

  return (
    <>
      <TitleText className="mt-6 mb-10">Select a token to {selectedAsset?.operationType}</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {exchangeAssets.map((asset) => (
          <Link
            to={Paths.EXCHANGE_WIDGET}
            key={asset.chainId}
            onClick={() => setSelectedAsset((prev) => ({ operationType: prev?.operationType, ...asset }))}
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
