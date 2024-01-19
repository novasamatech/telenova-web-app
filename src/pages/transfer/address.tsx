'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from '@nextui-org/react';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { validateAddress } from '@/common/utils/address';
import { Icon, HelpText, BodyText, Identicon, Layout } from '@/components';
import { Paths } from '@/common/routing';

export default function AddressPage() {
  const router = useRouter();
  const { BackButton, MainButton, webApp } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();
  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  useEffect(() => {
    router.prefetch(Paths.TRANSFER_AMOUNT);
    const callback = () => {
      router.push(Paths.TRANSFER_SELECT_TOKEN);
    };

    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  useEffect(() => {
    const callback = () => {
      setSelectedAsset((prev) => ({ ...prev!, destinationAddress: address }));
      router.push(Paths.TRANSFER_AMOUNT);
    };

    if (address.length) {
      MainButton?.show();
      isAddressValid ? MainButton?.enable() : MainButton?.disable();
      MainButton?.onClick(callback);
    } else {
      MainButton?.hide();
    }

    return () => {
      MainButton?.offClick(callback);
    };
  }, [address, isAddressValid]);

  const handleChange = (value: string) => {
    setAddress(value);
    setIsAddressValid(validateAddress(value));
  };

  const handleQrCode = () => {
    webApp?.showScanQrPopup({ text: 'Scan QR code' }, (value) => {
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
          <div className="flex gap-2 items-center mt-4 self-start break-all">
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

AddressPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
