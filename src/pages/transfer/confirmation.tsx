'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// @ts-expect-error no types
import MiddleEllipsis from 'react-middle-ellipsis';
import { Divider } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Icon, Identicon, LargeTitleText, TextBase, Plate, BodyText, CaptionText } from '@/components';
import { IconNames } from '@/components/Icon/types';

export default function ConfirmationPage() {
  const router = useRouter();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();

  useEffect(() => {
    const mainCallback = () => {
      router.push(Paths.TRANSFER_RESULT);
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
      MainButton?.offClick(mainCallback);
      BackButton?.offClick(backCallback);
    };
  }, []);

  const details = [
    {
      title: 'Recipients address',
      value: selectedAsset?.destination,
    },
    {
      title: 'Fee',
      value: `${selectedAsset?.fee} ${selectedAsset?.symbol}`,
    },
    {
      title: 'Total amount',
      value: `${selectedAsset?.amount} ${selectedAsset?.symbol}`,
    },
    {
      title: 'Network',
      value: selectedAsset?.name,
    },
  ];

  return (
    <div className="min-h-screen p-4 w-full">
      <div className="grid grid-cols-[40px,1fr] items-center">
        <Identicon address={selectedAsset?.destination} />
        <HeadlineText className="flex gap-1">
          Send to
          <span className="w-[130px]">
            <MiddleEllipsis>
              <TextBase as="span" className="text-body-bold">
                {selectedAsset?.destination}
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
      <Plate className="rounded-lg p-4 w-full">
        {details.map(({ title, value }, index) => (
          <>
            {index !== 0 && <Divider key={title} className="my-4" />}
            <div className="grid gap-2 break-all" key={title}>
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              <CaptionText>{value}</CaptionText>
            </div>
          </>
        ))}
      </Plate>
    </div>
  );
}
