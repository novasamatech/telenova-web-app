import { type FC } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { $params, $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { pickAsset, shareQrAddress } from '@/common/utils';
import { BodyText, HeadlineText, Icon, MediumTitle, Plate, TitleText } from '@/components';

export const clientLoader = (({ params }) => {
  return $params('/receive/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { assets } = useGlobalContext();

  const selectedAsset = pickAsset({ assets, chainId, assetId });

  if (!selectedAsset || !selectedAsset.asset) {
    return null;
  }
  const asset = selectedAsset.asset;

  return (
    <>
      <BackButton onClick={() => navigate($path('/receive/token-select'))} />
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
};

export default Page;
