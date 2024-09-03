import { QRCode } from 'react-qrcode-logo';
import { useNavigate } from 'react-router-dom';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { networkModel } from '@/models/network';
import { telegramModel } from '@/models/telegram';
import { walletModel } from '@/models/wallet';
import { copyToClipboard, shareQrAddress, toAddress } from '@/shared/helpers';
import { BodyText, HeadlineText, Icon, MediumTitle, Plate, TitleText } from '@/ui/atoms';

export const clientLoader = (({ params }) => {
  return $params('/receive/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const wallet = useUnit(walletModel.$wallet);
  const webApp = useUnit(telegramModel.$webApp);
  const [chains, assets] = useUnit([networkModel.$chains, networkModel.$assets]);

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  if (!selectedAsset || !wallet?.publicKey || !chains[typedChainId] || !webApp) return null;

  const address = toAddress(wallet.publicKey, { prefix: chains[typedChainId].addressPrefix });
  const isTelegramWeb = webApp.platform === 'weba' || webApp.platform === 'webk';

  return (
    <>
      <BackButton onClick={() => navigate($path('/receive/token-select'))} />
      <TitleText className="mt-2">Receive {selectedAsset.symbol}</TitleText>
      <div className="flex flex-col items-center">
        <Plate className="my-6 flex h-[344px] w-[232px] flex-col items-center gap-3 break-all">
          <QRCode
            enableCORS
            size={200}
            quietZone={0}
            eyeRadius={30}
            value={address}
            logoPadding={1}
            logoWidth={60}
            logoHeight={60}
            logoPaddingStyle="circle"
            logoImage={selectedAsset.icon}
            id={`qrcode_${selectedAsset.symbol}`}
          />
          <BodyText className="text-text-hint">{chains[typedChainId].name} address</BodyText>
          <HeadlineText id="address-copy" className="text-text-hint" align="center">
            {address}
          </HeadlineText>
        </Plate>
        <Popover showArrow placement="top" color="foreground" radius="sm" size="md">
          <PopoverTrigger>
            <Button
              color="primary"
              className="min-h-[50px] w-[200px] rounded-full"
              onClick={() => copyToClipboard('address-copy', address)}
            >
              <MediumTitle as="span" className="text-white">
                Copy address
              </MediumTitle>
            </Button>
          </PopoverTrigger>
          <PopoverContent>Address copied</PopoverContent>
        </Popover>
        {/* @ts-expect-error share functionality doesn't exist in Mozilla */}
        {!isTelegramWeb && navigator.canShare && (
          <Button
            color="primary"
            variant="flat"
            className="mt-4 min-h-[50px] w-[200px] rounded-full"
            onClick={() => shareQrAddress(`qrcode_${selectedAsset.symbol}`, address)}
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
