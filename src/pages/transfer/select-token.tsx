'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { TitleText, AssetBalance } from '@/components';

export default function SelectToken() {
  const router = useRouter();
  const { BackButton } = useTelegram();
  const { assets, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    BackButton?.show();
    BackButton?.onClick(() => {
      router.push(Paths.TRANSFER);
    });
  }, []);

  return (
    <div className="min-h-screen p-4">
      <TitleText className="mt-10 mb-6">Select a token to send</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {assets.map((asset) => (
          <Link href={Paths.TRANSFER_ADDRESS} key={asset.chainId} onClick={() => setSelectedAsset(asset)}>
            <AssetBalance
              asset={asset}
              balance={asset.totalBalance}
              className="bg-white rounded-lg px-4 py-2 w-full"
              name={asset.name}
              showArrow
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
