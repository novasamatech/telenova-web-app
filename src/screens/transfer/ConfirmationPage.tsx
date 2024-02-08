import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { handleSend } from '@/common/utils/extrinsics';
import {
  HeadlineText,
  Icon,
  Identicon,
  LargeTitleText,
  Plate,
  BodyText,
  MediumTitle,
  TruncateAddress,
} from '@/components';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { TrasferAsset } from '@/common/types';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { submitExtrinsic } = useExtrinsicProvider();

  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();

  useEffect(() => {
    if (!selectedAsset) return;

    const mainCallback = async () => {
      MainButton?.showProgress(false);
      await handleSend(submitExtrinsic, selectedAsset as TrasferAsset).then(() => {
        navigate(Paths.TRANSFER_RESULT);
      });
    };
    const backCallback = () => {
      navigate(Paths.TRANSFER_AMOUNT);
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
      MainButton?.setText('Continue');
    };
  }, [selectedAsset]);

  const symbol = selectedAsset?.asset?.symbol;
  const details = [
    {
      title: 'Recipients address',
      value: selectedAsset?.destinationAddress,
    },
    {
      title: 'Fee',
      value: `${selectedAsset?.fee} ${symbol}`,
    },
    {
      title: 'Total amount',
      value: `${(Number(selectedAsset?.amount) + (selectedAsset?.fee as number)).toFixed(5)} ${symbol}`,
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
          <TruncateAddress address={selectedAsset?.destinationAddress} className="max-w-[130px]" />
        </HeadlineText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <Icon name={symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{symbol}</LargeTitleText>
        <LargeTitleText>{selectedAsset?.amount}</LargeTitleText>
      </div>
      <Plate className="w-full pr-0">
        {details.map(({ title, value }, index) => (
          <div key={title}>
            {index !== 0 && <Divider className="my-4 h-[0.5px] w-auto" />}
            <div className="grid gap-2 break-all pr-4">
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              <MediumTitle>{value}</MediumTitle>
            </div>
          </div>
        ))}
      </Plate>
    </>
  );
}
