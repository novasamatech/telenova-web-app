import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, Icon, Identicon, LargeTitleText, BodyText, TokenPrice, TruncateAddress } from '@/components';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { getTransferDetails } from '@/common/utils/balance';
import { TrasferAsset } from '@/common/types';

export default function AmountPage() {
  const navigate = useNavigate();
  const { estimateFee, getExistentialDeposit } = useExtrinsicProvider();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  const [amount, setAmount] = useState<string>('');
  const [transferAll, setTransferAll] = useState(false);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('');
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
      setIsAmountValid(+amount <= +max);
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

      return () => {
        MainButton?.setText('Continue');
      };
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
    if (maxAmountToSend === '') return;
    const validateGift = selectedAsset?.isGift ? +maxAmountToSend >= deposit : true;
    setTransferAll(true);
    setAmount(String(maxAmountToSend));
    setIsAmountValid(Boolean(maxAmountToSend) && validateGift);
  };

  const handleChange = (value: string) => {
    const formattedValue = value.trim().replace(/,/g, '.');
    setTransferAll(false);
    const validateGift = selectedAsset?.isGift ? !!deposit && +formattedValue >= deposit : true;

    setIsAmountValid(!!Number(formattedValue) && +formattedValue <= +maxAmountToSend && validateGift);
    setAmount(formattedValue);
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
        <Button variant="light" size="md" className="p-2" onClick={handleMaxSend}>
          <HeadlineText className="text-text-link">
            Max: {maxAmountToSend || <CircularProgress size="sm" className="inline-block h-[22px]" />}{' '}
            {selectedAsset?.asset?.symbol}
          </HeadlineText>
        </Button>
      </div>
      <div className="mb-6 mt-5 grid grid-cols-[40px,1fr,auto] gap-2 h-[40px] items-center">
        <Icon name={selectedAsset?.asset?.symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{selectedAsset?.asset?.symbol}</LargeTitleText>
        <Input
          fullWidth={false}
          variant="underlined"
          className="mt-[-10px] font-manrope"
          classNames={{ input: ['text-right !text-large-title max-w-[160px]'] }}
          value={amount}
          isInvalid={!isAmountValid}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          onValueChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        <TokenPrice priceId={selectedAsset?.asset?.priceId} balance={amount || '0'} showBalance={isAmountValid} />
        {!isAmountValid && (
          <>
            <BodyText align="right" className="text-text-danger">
              {+amount > +maxAmountToSend ? 'Insufficient balance' : 'Invalid amount'} <br />
              {selectedAsset?.isGift && !!deposit && +amount < deposit && (
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
