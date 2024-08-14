import { QRCode } from 'react-qrcode-logo';
import { useNavigate } from 'react-router-dom';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { BodyText, HeadlineText, Icon, MediumTitle, Plate, TitleText } from '@/components';
import { networkModel, walletModel } from '@/models';
import { shareQrAddress, toAddress } from '@/shared/helpers';

export const clientLoader = (({ params }) => {
  return $params('/receive/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);
  const wallet = useUnit(walletModel.$wallet);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  if (!selectedAsset || !wallet?.publicKey || !chains[typedChainId]) return null;

  const address = toAddress(wallet.publicKey, { prefix: chains[typedChainId].addressPrefix });

  return (
    <>
      <BackButton onClick={() => navigate($path('/receive/token-select'))} />
      <TitleText className="mt-2">Receive {selectedAsset.symbol}</TitleText>
      <div className="flex flex-col items-center">
        <Plate className="flex flex-col items-center gap-3 w-[232px] h-[344px] break-all my-6">
          <QRCode
            value={address}
            logoImage={`/assets/${selectedAsset.symbol}.svg`}
            quietZone={0}
            logoPadding={2}
            eyeRadius={30}
            size={200}
            id={`qrcode_${selectedAsset.symbol}`}
          />
          <BodyText className="text-text-hint">{chains[typedChainId].name} address</BodyText>
          <HeadlineText className="text-text-hint" align="center">
            {address}
          </HeadlineText>
        </Plate>
        <Popover showArrow placement="top" color="foreground" radius="sm" size="md">
          <PopoverTrigger>
            <Button
              color="primary"
              className="w-[200px] min-h-[50px] rounded-full"
              // navigator.clipboard is undefined in web version of Telegram
              onClick={() => navigator.clipboard?.writeText(address)}
            >
              <MediumTitle as="span" className="text-white">
                Copy address
              </MediumTitle>
            </Button>
          </PopoverTrigger>
          <PopoverContent>Address copied</PopoverContent>
        </Popover>
        {/* @ts-expect-error share functionality doesn't exist in Mozilla */}
        {navigator.canShare && (
          <Button
            color="primary"
            variant="flat"
            className="w-[200px] min-h-[50px] mt-4 rounded-full"
            onClick={() => shareQrAddress(selectedAsset.symbol, address)}
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
