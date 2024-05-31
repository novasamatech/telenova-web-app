import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { QRCode } from 'react-qrcode-logo';

import { useTelegram, useGlobalContext } from '@common/providers';
import { useMainButton } from '@/common/telegram/useMainButton';
import { shareQrAddress } from '@/common/utils/address';
import { BodyText, HeadlineText, Icon, MediumTitle, Plate, TitleText } from '@/components';
import { Paths } from '@/common/routing';

export default function ReceivePage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();
  const { hideMainButton } = useMainButton();

  useEffect(() => {
    BackButton?.show();
    hideMainButton();

    const callback = async () => {
      navigate(Paths.RECEIVE_SELECT_TOKEN);
    };
    BackButton?.onClick(callback);

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  if (!selectedAsset || !selectedAsset.asset) return null;
  const asset = selectedAsset.asset;

  return (
    <>
      <TitleText className="mt-2">Receive {asset.symbol}</TitleText>
      <div className="flex flex-col items-center">
        <Plate className="flex flex-col items-center gap-3 w-[232px] h-[344px] break-all my-6">
          <QRCode
            value={selectedAsset.address}
            logoImage={`/assets/${asset.symbol}.svg`}
            quietZone={0}
            logoPadding={2}
            eyeRadius={30}
            size={200}
            id={`qrcode_${asset.symbol}`}
          />
          <BodyText className="text-text-hint">{selectedAsset.chainName} address</BodyText>
          <HeadlineText className="text-text-hint" align="center">
            {selectedAsset.address}
          </HeadlineText>
        </Plate>
        <Popover showArrow placement="top" color="foreground" radius="sm" size="md">
          <PopoverTrigger>
            <Button
              color="primary"
              className="w-[200px] min-h-[50px] rounded-full"
              onClick={() => navigator.clipboard.writeText(selectedAsset.address!)}
            >
              <MediumTitle as="span" className="text-white">
                Copy address
              </MediumTitle>
            </Button>
          </PopoverTrigger>
          <PopoverContent>Address coppied</PopoverContent>
        </Popover>
        {/* @ts-expect-error share functionality doesn't exist in Mozilla */}
        {navigator.canShare && (
          <Button
            color="primary"
            variant="flat"
            className="w-[200px] min-h-[50px] mt-4 rounded-full"
            onClick={() => shareQrAddress(asset.symbol, selectedAsset.address!)}
          >
            <Icon name="ArrowUp" size={24} className="text-text-on-button-bold" />
            <MediumTitle as="span" className="text-text-on-button-bold">
              Share
            </MediumTitle>
          </Button>
        )}
      </div>
    </>
  );
}
