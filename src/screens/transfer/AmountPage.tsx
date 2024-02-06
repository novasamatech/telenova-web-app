import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import {
  HeadlineText,
  Icon,
  Identicon,
  CaptionText,
  LargeTitleText,
  BodyText,
  TokenPrice,
  TruncateAddress,
} from '@/components';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { getTransferDetails } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';

export default function AmountPage() {
  const navigate = useNavigate();
  const { estimateFee, getExistentialDeposit } = useExtrinsicProvider();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>();
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>();
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [deposit, setDeposit] = useState(0);

  useEffect(() => {
    MainButton?.setText(selectedAsset?.isGift ? 'Create Gift' : 'Continue');
    BackButton?.show();
    MainButton?.show();
    MainButton?.disable();

    const callback = () => {
      navigate(selectedAsset?.isGift ? Paths.TRANSFER_SELECT_TOKEN : Paths.TRANSFER_ADDRESS);
    };
    BackButton?.onClick(callback);

    if (!selectedAsset) return;

    (async () => {
      const { max, fee, formattedDeposit } = await getTransferDetails(
        selectedAsset as TrasferAsset,
        estimateFee,
        getExistentialDeposit,
      );

      setDeposit(formattedDeposit);
      setMaxAmountToSend(max);
      setIsAmountValid(+(amount || 0) <= +max);
      setSelectedAsset((prev) => ({ ...prev!, fee }));
    })();

    return () => {
      MainButton?.setText('Continue');
      BackButton?.offClick(callback);
      MainButton?.hide();
    };
  }, [BackButton, MainButton]);

  useEffect(() => {
    if (!isAmountValid || !Number(amount)) {
      MainButton?.disable();

      return;
    }

    const callback = () => {
      setSelectedAsset((prev) => ({ ...prev!, transferAll, amount }));
      navigate(selectedAsset?.isGift ? Paths.TRANSFER_CREATE_GIFT : Paths.TRANSFER_CONFIRMATION);
    };
    MainButton?.enable();
    MainButton?.onClick(callback);

    return () => {
      MainButton?.offClick(callback);
    };
  }, [amount, isAmountValid, maxAmountToSend]);

  const handleMaxSend = () => {
    if (maxAmountToSend === undefined) return;
    const validateGift = selectedAsset?.isGift ? +maxAmountToSend >= deposit : true;
    setTransferAll(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend) && validateGift);
  };

  const handleChange = (value: string) => {
    setTransferAll(false);
    const validateGift = selectedAsset?.isGift ? !!deposit && +value >= deposit : true;
    setIsAmountValid(!!Number(value) && +value <= +(maxAmountToSend || 0) && validateGift);
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
              <TruncateAddress address={selectedAsset?.destinationAddress} className="max-w-[120px]" />
            </HeadlineText>
          </>
        )}
        <Button variant="light" size="md" className="p-0" onClick={handleMaxSend}>
          <CaptionText className="text-text-link">
            Max: {maxAmountToSend || <CircularProgress size="sm" className="inline-block" />}{' '}
            {selectedAsset?.asset?.symbol}
          </CaptionText>
        </Button>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] gap-2 h-[40px]">
        <Icon name={selectedAsset?.asset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.asset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="mt-[-10px]"
          classNames={{ input: ['text-right !text-large-title max-w-[160px]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          type="number"
          placeholder="0"
          onValueChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        <TokenPrice priceId={selectedAsset?.asset?.priceId} balance={amount} showBalance={isAmountValid} />
        {!isAmountValid && (
          <>
            <BodyText align="right" className="text-text-danger">
              Invalid amount
              <br />
              {selectedAsset?.isGift && !!deposit && +(amount || 0) < deposit && (
                <BodyText as="span" className="text-text-danger">
                  Your gift should remain above the minimal network deposit {deposit} {selectedAsset?.asset?.symbol}
                </BodyText>
              )}
            </BodyText>
          </>
        )}
      </div>
      {!transferAll && isAmountValid && maxAmountToSend && amount && +maxAmountToSend - +amount < deposit && (
        <BodyText align="left" className="text-text-hint mt-4">
          The balance that remains after sending this amount is less than the minimal network deposit ({deposit}), you
          may want to send Max instead or choose a different amount.
        </BodyText>
      )}
    </>
  );
}
