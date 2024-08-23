import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { telegramModel } from '@/models/telegram';
import { validateAddress } from '@/shared/helpers';
import { BodyText, HelpText, Icon, Identicon, Input } from '@/ui/atoms';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  const handleChange = (value: string) => {
    setAddress(value);
    setIsAddressValid(validateAddress(value));
  };

  const handleQrCode = () => {
    if (!webApp) return;

    webApp.showScanQrPopup({ text: 'Scan QR code' }, value => {
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
            <div className="mt-4 flex items-center gap-2 break-all">
              <Identicon address={address} />
              <BodyText> {address}</BodyText>
            </div>
          ) : (
            <HelpText className="mt-1 text-text-hint">Invalid address, enter a correct one</HelpText>
          ))}
        {!address && (
          <Button variant="light" className="mt-4 gap-0 self-start text-text-link" onClick={handleQrCode}>
            <Icon name="ScanQr" className="mr-2 h-5 w-5" />
            Scan QR code
          </Button>
        )}
      </div>
    </>
  );
};

export default Page;
