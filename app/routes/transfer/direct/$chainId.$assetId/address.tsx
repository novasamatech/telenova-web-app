import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { BodyText, HelpText, Icon, Identicon, Input } from '@/components';
import { validateAddress } from '@/shared/helpers';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { webApp } = useTelegram();

  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

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
      <MainButton
        hidden={!address.length}
        disabled={!isAddressValid}
        onClick={() => {
          navigate($path('/transfer/direct/:chainId/:assetId/:address/amount', { address, chainId, assetId }));
        }}
      />
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
            <HelpText className="text-text-hint mt-1">Invalid address, enter a correct one</HelpText>
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
