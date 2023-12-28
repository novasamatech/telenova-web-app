'use client';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
// @ts-expect-error no types
import MiddleEllipsis from 'react-middle-ellipsis';
import { Divider } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import {
  HeadlineText,
  Icon,
  Identicon,
  LargeTitleText,
  TextBase,
  Plate,
  BodyText,
  CaptionText,
  Layout,
} from '@/components';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { handleSend } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';

export default function ConfirmationPage() {
  const router = useRouter();
  const { submitExtrinsic } = useExtrinsicProvider();

  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();

  useEffect(() => {
    if (!selectedAsset) return;

    const mainCallback = async () => {
      MainButton?.showProgress(false);
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset).then(() => {
        router.push(Paths.TRANSFER_RESULT);
      });
    };
    const backCallback = () => {
      router.push(Paths.TRANSFER_AMOUNT);
    };

    BackButton?.show();
    BackButton?.onClick(backCallback);

    MainButton?.show();
    MainButton?.setText('Confirm');
    MainButton?.onClick(mainCallback);

    return () => {
      MainButton?.hideProgress();
      MainButton?.offClick(mainCallback);
      BackButton?.offClick(backCallback);
    };
  }, [selectedAsset]);

  const details = [
    {
      title: 'Recipients address',
      value: selectedAsset?.destinationAddress,
    },
    {
      title: 'Fee',
      value: `${selectedAsset?.fee} ${selectedAsset?.symbol}`,
    },
    {
      title: 'Total amount',
      value: `${(Number(selectedAsset?.amount) + (selectedAsset?.fee as number)).toFixed(5)} ${selectedAsset?.symbol}`,
    },
    {
      title: 'Network',
      value: selectedAsset?.name,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-[40px,1fr] items-center">
        <Identicon address={selectedAsset?.destinationAddress} />
        <HeadlineText className="flex gap-1">
          Send to
          <span className="w-[130px]">
            <MiddleEllipsis>
              <TextBase as="span" className="text-body-bold">
                {selectedAsset?.destinationAddress}
              </TextBase>
            </MiddleEllipsis>
          </span>
        </HeadlineText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <Icon name={selectedAsset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.symbol}</LargeTitleText>
        <LargeTitleText>{selectedAsset?.amount}</LargeTitleText>
      </div>
      <Plate className="w-full">
        {details.map(({ title, value }, index) => (
          <div key={title}>
            {index !== 0 && <Divider className="my-4" />}
            <div className="grid gap-2 break-all">
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              <CaptionText>{value}</CaptionText>
            </div>
          </div>
        ))}
      </Plate>
    </>
  );
}

ConfirmationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
