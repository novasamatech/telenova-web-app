'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { encodeAddress } from '@polkadot/util-crypto';
import { Avatar, Button } from '@nextui-org/react';

import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { useBalances } from '@common/balances/BalanceProvider';
import { useChainRegistry } from '@common/chainRegistry';
import { getMnemonic, resetWallet } from '@common/wallet';
import { claimGift, updateAssetsBalance } from '@/common/utils/balance';
import { ChainAssetAccount } from '@common/types';
import { IAssetBalance } from '@common/balances/types';
import { Paths } from '@/common/routing';
import { BodyText, CaptionText, Icon, AssetsList, Plate, Price, IconButton } from '@/components';

export const DashboardMain = () => {
  const router = useRouter();
  const { getAllChains, getAssetBySymbol } = useChainRegistry();
  const { submitExtrinsic } = useExtrinsicProvider();
  const { subscribeBalance } = useBalances();
  const { publicKey, assets, isGiftClaimed, setIsGiftClaimed, setAssets } = useGlobalContext();
  const { user, MainButton, BackButton, webApp } = useTelegram();

  useEffect(() => {
    if (isGiftClaimed || !webApp?.initDataUnsafe.start_param || !publicKey) {
      return;
    }
    const [seed, symbol] = webApp.initDataUnsafe.start_param.split('_');
    (async () => {
      const chain = await getAssetBySymbol(symbol);
      const address = encodeAddress(publicKey, chain.chain.addressPrefix);

      claimGift(seed, address, chain.chain.chainId, submitExtrinsic)
        .then(() => {
          alert('Gift claimed successfully!');
        })
        .catch(() => {
          alert('Failed to claim gift');
        })
        .finally(() => {
          setIsGiftClaimed(true);
        });
    })();
  }, [webApp, publicKey, isGiftClaimed]);

  useEffect(() => {
    MainButton?.hide();
    BackButton?.hide();
    if (!publicKey) {
      return;
    }
    (async () => {
      const chains = await getAllChains();
      console.info(`Found all ${chains.length} chains`);

      for (const chain of chains) {
        const account: ChainAssetAccount = {
          chainId: chain.chainId,
          publicKey: publicKey,
          name: chain.name,
          assetId: chain.assets[0].assetId,
          symbol: chain.assets[0].symbol,
          precision: chain.assets[0].precision,
          addressPrefix: chain.addressPrefix,
        };
        const address = encodeAddress(publicKey, chain.addressPrefix);

        if (!assets.length) {
          setAssets((prevAssets) => [...prevAssets, { ...account, address }]);
        }

        subscribeBalance(account, (balance: IAssetBalance) => {
          console.info(`${address} ${chain.name} => balance: ${balance.total().toString()}`);
          setAssets((prevAssets) => updateAssetsBalance(prevAssets, chain, balance));
        });
      }

      setAssets((prevAssets) => prevAssets.sort((a, b) => a.symbol.localeCompare(b.symbol)));
    })();
  }, [publicKey]);

  function clearWallet(clearLocal?: boolean) {
    resetWallet(clearLocal);
    router.replace(Paths.ONBOARDING);
  }

  return (
    <div className="min-h-screen flex flex-col p-4 break-all">
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-6">
        <Avatar src={user?.photo_url} className="w-10 h-10" name={user?.first_name[0]} />
        <CaptionText className="self-center">Hello, {user?.first_name || 'friend'}</CaptionText>
        <Icon name="settings" size={40} />
      </div>
      <Plate className="flex flex-col items-center mb-2 rounded-3xl">
        <BodyText className="text-text-hint">Total balance</BodyText>
        <Price amount="0" />
        <div className="grid grid-cols-3 w-full justify-items-center mt-4">
          <IconButton text="Send" iconName="send" color="primary" onClick={() => router.push(Paths.TRANSFER)} />
          <IconButton text="Receive" iconName="receive" color="success" onClick={() => router.push(Paths.TRANSFER)} />
          <IconButton text="Buy" iconName="buy" color="secondary" onClick={() => router.push(Paths.TRANSFER)} />
        </div>
      </Plate>
      <Button
        variant="light"
        size="lg"
        className="w-full bg-gradient-to-tr from-yellow-500 to-pink-500 text-white shadow-lg h-[50px]"
        onClick={() => router.push(Paths.GIFTS)}
      >
        Gifts
      </Button>
      <Plate className="flex flex-col my-2 rounded-3xl">
        <CaptionText>Assets</CaptionText>
        <AssetsList />
      </Plate>

      <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
        Reset Wallet
      </button>
      <button className="btn btn-blue mt-4" onClick={() => clearWallet(true)}>
        Reset Wallet Local
      </button>
      <BodyText>
        Debug info: <br /> mnemonic: {getMnemonic()}
        <br />
        public key: {publicKey}
      </BodyText>
    </div>
  );
};
