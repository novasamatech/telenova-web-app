import { useState } from 'react';

import { Button } from '@nextui-org/react';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { navigationModel } from '@/models/navigation';
import { networkModel } from '@/models/network';
import { BackButton, MainButton, TelegramApi } from '@/shared/api';
import { isEvmChain, toAddress, toShortAddress, validateAddress } from '@/shared/helpers';
import { BodyText, HelpText, Icon, Identicon, Input } from '@/ui/atoms';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/address', params);
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId } = useLoaderData<typeof clientLoader>();

  const chains = useUnit(networkModel.$chains);

  const [address, setAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  const handleChange = (value: string) => {
    setAddress(value);
    setIsAddressValid(validateAddress(value, chains[chainId as ChainId]));
  };

  const handleQrCode = () => {
    TelegramApi.showScanQrPopup({ text: 'Scan QR code' }, value => {
      setAddress(value);
      setIsAddressValid(validateAddress(value, chains[chainId as ChainId]));
    });
  };

  const navigate = () => {
    const params = {
      address: toAddress(address, { chain: chains[chainId as ChainId] }),
      assetId,
      chainId,
    };

    navigationModel.input.navigatorPushed({
      type: 'navigate',
      to: $path('/transfer/direct/:chainId/:assetId/:address/amount', params),
    });
  };

  const navigateBack = () => {
    navigationModel.input.navigatorPushed({
      type: 'navigate',
      to: $path('/transfer/direct/token-select'),
    });
  };

  return (
    <>
      <MainButton hidden={!address.length} disabled={!isAddressValid} onClick={navigate} />
      <BackButton onClick={navigateBack} />
      <div className="flex flex-col">
        <Input
          isClearable
          variant="flat"
          placeholder="Enter address"
          className="font-manrope"
          value={address}
          isInvalid={!isAddressValid}
          onValueChange={handleChange}
          onClear={() => setAddress('')}
        />
        {address && isAddressValid && (
          <div className="mt-4 flex items-center gap-x-2 break-all">
            <Identicon
              className="flex-shrink-0"
              address={address}
              theme={isEvmChain(chains[chainId as ChainId]) ? 'ethereum' : 'polkadot'}
            />
            <BodyText>{toShortAddress(address, 15)}</BodyText>
          </div>
        )}

        {address && !isAddressValid && (
          <HelpText className="mt-1 text-text-danger">Invalid address, enter a correct one</HelpText>
        )}

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
