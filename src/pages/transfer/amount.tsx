'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MiddleEllipsis from 'react-middle-ellipsis';
import { Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Icon, Identicon, CaptionText, LargeTitleText, TextBase } from '@/components';
import { IconNames } from '@/components/Icon/types';

export default function AmountPage() {
  const router = useRouter();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();
  const [amount, setAmount] = useState('0');

  useEffect(() => {
    BackButton?.show();
    MainButton?.disable();
    BackButton?.onClick(() => {
      router.push(Paths.TRANSFER_ADDRESS);
    });
  }, []);

  return (
    <div className="min-h-screen p-4">
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        <Identicon address={selectedAsset?.destination} />
        <HeadlineText className="flex gap-1">
          Send to
          <div className="w-[130px]">
            <MiddleEllipsis>
              <TextBase as="span" className="text-body-bold">
                {selectedAsset?.destination}
              </TextBase>
            </MiddleEllipsis>
          </div>
        </HeadlineText>
        <CaptionText className="text-text-link">
          Max: {selectedAsset?.transferableBalance} {selectedAsset?.symbol}
        </CaptionText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <Icon name={selectedAsset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          classNames={{ input: ['text-right !text-large-title max-w-[150px]'] }}
          value={amount}
          onValueChange={setAmount}
        />
      </div>
    </div>
  );
}
