'use client';
import { ReactElement, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { TitleText, AssetBalance, Layout } from '@/components';

export default function SelectTokenPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets, setSelectedAsset, selectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      navigate(Paths.TRANSFER);
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mt-10 mb-6">Select a token to send</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {assets.map((asset) => (
          <Link
            to={selectedAsset?.isGift ? Paths.TRANSFER_AMOUNT : Paths.TRANSFER_ADDRESS}
            key={asset.chainId}
            onClick={() => setSelectedAsset((prev) => (prev ? { isGift: prev.isGift, ...asset } : asset))}
          >
            <AssetBalance
              asset={asset.asset}
              balance={asset.totalBalance}
              className="bg-white rounded-lg px-4 py-2 w-full"
              name={asset.name}
              showArrow
            />
          </Link>
        ))}
      </div>
    </>
  );
}

SelectTokenPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
