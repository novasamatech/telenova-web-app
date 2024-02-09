import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { QRCode } from 'react-qrcode-logo';
import Carousel from 'react-simply-carousel';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { shareQrAddress } from '@/common/utils/address';
import { BodyText, HeadlineText, MediumTitle, Plate, TitleText } from '@/components';
import { Paths } from '@/common/routing';

const dotStyle = {
  height: 10,
  width: 10,
  borderRadius: '50%',
  border: 0,
  margin: 2,
};

export default function ReceivePage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets } = useGlobalContext();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { hideMainButton } = useMainButton();

  useEffect(() => {
    BackButton?.show();
    hideMainButton();

    const callback = async () => {
      navigate(Paths.DASHBOARD);
    };
    BackButton?.onClick(callback);

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex items-center flex-col h-screen justify-center mx-[-16px]">
      <TitleText className="mb-7">Receive {assets[activeSlideIndex].asset.symbol}</TitleText>
      <Carousel
        activeSlideIndex={activeSlideIndex}
        containerProps={{
          style: {
            gap: 10,
            width: '100%',
            position: 'relative',
          },
        }}
        dotsNav={{
          show: true,
          containerProps: {
            style: {
              position: 'absolute',
              top: '-20px',
            },
          },
          itemBtnProps: {
            style: {
              ...dotStyle,
              background: 'lightgray',
            },
          },
          activeItemBtnProps: {
            style: {
              ...dotStyle,
              background: 'gray',
            },
          },
        }}
        swipeTreshold={30}
        itemsToShow={3}
        itemsToScroll={1}
        speed={400}
        easing="ease"
        updateOnItemClick
        centerMode
        infinite
        preventScrollOnSwipe
        onRequestChange={setActiveSlideIndex}
      >
        {assets.map((asset) => (
          <div className="flex flex-col items-center gap-3 border-x-[12px] border-transparent" key={asset.address}>
            <Plate className="flex flex-col items-center gap-3 w-[232px] h-[344px] break-all">
              <QRCode
                value={asset.address}
                logoImage={`/images/assets/${asset.asset.symbol}.svg`}
                quietZone={0}
                logoPadding={2}
                eyeRadius={30}
                size={200}
                id={`qrcode_${asset.asset.symbol}`}
              />
              <BodyText className="text-text-hint">{asset.asset.symbol} address</BodyText>
              <HeadlineText className="text-text-hint" align="center">
                {asset.address}
              </HeadlineText>
            </Plate>
          </div>
        ))}
      </Carousel>
      <Popover showArrow placement="top" color="foreground" radius="sm" size="md">
        <PopoverTrigger>
          <Button
            color="primary"
            className="w-[200px] h-[50px] rounded-full mt-6"
            onClick={() => navigator.clipboard.writeText(assets[activeSlideIndex].address)}
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
          className="w-[200px] h-[50px] mt-4 rounded-full"
          onClick={() => shareQrAddress(assets[activeSlideIndex].asset.symbol, assets[activeSlideIndex].address)}
        >
          <MediumTitle as="span" className="text-text-on-button-bold">
            Share
          </MediumTitle>
        </Button>
      )}
    </div>
  );
}
