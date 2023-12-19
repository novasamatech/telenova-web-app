import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Icon, HelpText, BodyText, Identicon } from '@/components';
import { Paths } from '@/common/routing';

export default function Address() {
  const router = useRouter();
  const { BackButton, MainButton, webApp } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();
  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  useEffect(() => {
    BackButton?.show();
    BackButton?.onClick(() => {
      router.push(Paths.TRANSFER_SELECT_TOKEN);
    });
  }, [BackButton, MainButton]);

  useEffect(() => {
    if (address.length) {
      MainButton?.show();
      MainButton?.onClick(() => {
        setSelectedAsset((prev) => ({ ...prev!, destination: address }));
        router.push(Paths.TRANSFER_AMOUNT);
      });
      isAddressValid ? MainButton?.enable() : MainButton?.disable();
    } else {
      MainButton?.hide();
    }
  }, [address, isAddressValid]);

  const handleChange = (value: string) => {
    setAddress(value);

    // TODO: validate address
    setIsAddressValid(value.length > 10);
  };

  const handleQrCode = () => {
    webApp?.showScanQrPopup({ text: 'Scan QR code' }, (value) => {
      setAddress(value);

      // TODO: validate address
      setIsAddressValid(true);
      webApp.closeScanQrPopup();
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center w-full">
      <Input
        isClearable
        variant="flat"
        placeholder="Enter address"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1 text-left',
            'group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
        }}
        value={address}
        onValueChange={handleChange}
        onClear={() => setAddress('')}
      />
      {address &&
        (isAddressValid ? (
          <div className="flex gap-2 items-center mt-4 self-start">
            <Identicon address={address} />
            <BodyText> {address}</BodyText>
          </div>
        ) : (
          <HelpText className="text-text-hint">Invalid address, enter a correct one</HelpText>
        ))}
      {!address && (
        <Button variant="light" className="text-text-link mt-4 gap-0 self-start" onClick={handleQrCode}>
          <Icon name="scanQr" className="w-5 h-5 mr-2" />
          Scan QR code
        </Button>
      )}
    </div>
  );
}
