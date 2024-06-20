import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { useMainButton } from '@/common/telegram/useMainButton';
import { validateAddress } from '@/common/utils/address';
import { BodyText, HelpText, Icon, Identicon, Input } from '@/components';

export default function AddressPage() {
  const navigate = useNavigate();
  const { BackButton, webApp } = useTelegram();
  const { hideMainButton, reset, addMainButton, mainButton } = useMainButton();

  const { setSelectedAsset } = useGlobalContext();
  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  useEffect(() => {
    const callback = () => {
      navigate($path('/transfer/select-token'));
    };

    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  useEffect(() => {
    const callback = () => {
      setSelectedAsset(prev => ({ ...prev!, destinationAddress: address }));
      navigate($path('/transfer/amount'));
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
    <div className="flex flex-col items-center">
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
          <div className="flex gap-2 items-center mt-4 self-start break-all">
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
  );
}
