import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';

import { Button } from '@nextui-org/react';
import { $params, $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { validateAddress } from '@/common/utils';
import { BodyText, HelpText, Icon, Identicon, Input } from '@/components';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const { hideMainButton, reset, addMainButton, mainButton } = useMainButton();

  const { setSelectedAsset } = useGlobalContext();
  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  useEffect(() => {
    const callback = () => {
      setSelectedAsset(prev => ({ ...prev!, destinationAddress: address }));
      navigate($path('/transfer/direct/:chainId/:assetId/:address/amount', { address, chainId, assetId }));
    };

    if (address.length) {
      isAddressValid ? mainButton.enable() : mainButton.disable();
      addMainButton(callback);
    } else {
      hideMainButton();
    }

    return () => {
      reset();
    };
  }, [address, isAddressValid]);

  const handleChange = (value: string) => {
    setAddress(value);
    setIsAddressValid(validateAddress(value));
  };

  const handleQrCode = () => {
    webApp?.showScanQrPopup({ text: 'Scan QR code' }, value => {
      setAddress(value);
      setIsAddressValid(validateAddress(value));
      webApp.closeScanQrPopup();
    });
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/transfer/direct/token-select'))} />
      <div className="flex flex-col">
        <Input
          isClearable
          variant="flat"
          placeholder="Enter address"
          className="font-manrope"
          value={address}
          onValueChange={handleChange}
          onClear={() => setAddress('')}
        />
        {address &&
          (isAddressValid ? (
            <div className="flex gap-2 items-center mt-4 break-all">
              <Identicon address={address} />
              <BodyText> {address}</BodyText>
            </div>
          ) : (
            <HelpText className="text-text-hint">Invalid address, enter a correct one</HelpText>
          ))}
        {!address && (
          <Button variant="light" className="text-text-link mt-4 gap-0 self-start" onClick={handleQrCode}>
            <Icon name="ScanQr" className="w-5 h-5 mr-2" />
            Scan QR code
          </Button>
        )}
      </div>
    </>
  );
};

export default Page;
