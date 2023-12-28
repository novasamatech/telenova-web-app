'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
// @ts-expect-error no types
import MiddleEllipsis from 'react-middle-ellipsis';
import { Button, CircularProgress, Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Icon, Identicon, CaptionText, LargeTitleText, TextBase, Layout } from '@/components';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { formatBalance, handleFee } from '@/common/utils/balance';
import { ChainId } from '@/common/types';

export default function AmountPage() {
  const router = useRouter();
  const { estimateFee } = useExtrinsicProvider();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState('0');
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>();
  const [isAmountValid, setIsAmountValid] = useState(true);

  useEffect(() => {
    router.prefetch(Paths.TRANSFER_CONFIRMATION);
    MainButton?.setText(selectedAsset?.isGift ? 'Create Gift' : 'Continue');
    BackButton?.show();
    MainButton?.show();
    MainButton?.disable();

    const callback = () => {
      router.push(selectedAsset?.isGift ? Paths.TRANSFER_SELECT_TOKEN : Paths.TRANSFER_ADDRESS);
    };
    BackButton?.onClick(callback);

    if (!selectedAsset) return;

    (async () => {
      const fee =
        selectedAsset.fee ||
        (await handleFee(
          estimateFee,
          selectedAsset.chainId as ChainId,
          selectedAsset.precision as number,
          selectedAsset.isGift,
        ));
      const formattedBalance = Number(
        formatBalance(selectedAsset.transferableBalance, selectedAsset.precision).formattedValue,
      );

      const max = Math.max(formattedBalance - fee, 0).toFixed(5);

      setMaxAmountToSend(max);
      setIsAmountValid(+amount <= +max);

      setSelectedAsset((prev) => ({ ...prev!, fee }));
    })();

    return () => {
      BackButton?.offClick(callback);
    };
  }, [BackButton, MainButton]);

  useEffect(() => {
    const callback = () => {
      setSelectedAsset((prev) => ({ ...prev!, transferAll, amount }));
      router.push(selectedAsset?.isGift ? Paths.TRANSFER_CREATE_GIFT : Paths.TRANSFER_CONFIRMATION);
    };

    if (!isAmountValid || !Number(amount)) return;
    MainButton?.enable();
    MainButton?.onClick(callback);

    return () => {
      MainButton?.offClick(callback);
    };
  }, [amount, isAmountValid, maxAmountToSend]);

  const handleMaxSend = () => {
    if (maxAmountToSend === undefined) return;
    setTransferAll(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend));
  };

  const handleChange = (value: string) => {
    setTransferAll(false);
    setIsAmountValid(!!Number(value) && +value <= +(maxAmountToSend || 0));
    setAmount(value);
  };

  return (
    <>
      <div className="grid grid-cols-[40px,1fr,auto] items-center">
        {selectedAsset?.isGift ? (
          <>
            <Icon name="gift" className="w-8 h-8" />
            <HeadlineText>Preparing Gift</HeadlineText>
          </>
        ) : (
          <>
            <Identicon address={selectedAsset?.destinationAddress} />
            <HeadlineText className="flex gap-1">
              Send to
              <span className="max-w-[120px]">
                <MiddleEllipsis>
                  <TextBase as="span" className="text-body-bold">
                    {selectedAsset?.destinationAddress}
                  </TextBase>
                </MiddleEllipsis>
              </span>
            </HeadlineText>
          </>
        )}
        <Button variant="light" size="md" className="p-0" onClick={handleMaxSend}>
          <CaptionText className="text-text-link">
            Max: {maxAmountToSend || <CircularProgress size="sm" className="inline-block" />} {selectedAsset?.symbol}
          </CaptionText>
        </Button>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] gap-2">
        <Icon name={selectedAsset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="h-[80px] mt-[-10px]"
          classNames={{ input: ['text-right !text-large-title max-w-[160px]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          errorMessage={!isAmountValid && 'Invalid amount'}
          onValueChange={handleChange}
        />
      </div>
    </>
  );
}

AmountPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
