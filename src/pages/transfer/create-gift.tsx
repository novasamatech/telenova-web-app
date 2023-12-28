'use client';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Layout } from '@/components';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { handleSend } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';
import { createGiftWallet } from '@/common/wallet';

export default function CreateGiftPage() {
  const router = useRouter();
  const { submitExtrinsic } = useExtrinsicProvider();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    BackButton?.hide();
    MainButton?.hide();
    MainButton?.setText('Gift created');

    if (!selectedAsset) return;
    const wallet = createGiftWallet(selectedAsset.addressPrefix as number);
    (async function () {
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset, wallet.address).then(() => {
        //TODO: create tg link
        MainButton?.show();
      });
    })();

    const mainCallback = async () => {
      router.push(Paths.TRANSFER_RESULT);
    };
    MainButton?.onClick(mainCallback);

    return () => {
      setSelectedAsset(null);
      MainButton?.hide();
      MainButton?.offClick(mainCallback);
    };
  }, []);

  return (
    <>
      <CircularProgress size="lg" className="m-auto my-10" />
      <HeadlineText className="text-text-hint" align="center">
        Creating your gift..
      </HeadlineText>
    </>
  );
}

CreateGiftPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
