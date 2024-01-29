'use client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encodeAddress } from '@polkadot/util-crypto';
import { Avatar, Button } from '@nextui-org/react';
import secureLocalStorage from 'react-secure-storage';

import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { useBalances } from '@common/balances/BalanceProvider';
import { useChainRegistry } from '@common/chainRegistry';
import { getMnemonic, resetWallet } from '@common/wallet';
import { getTotalBalance, updateAssetsBalance } from '@/common/utils/balance';
import { ChainAssetAccount } from '@common/types';
import { IAssetBalance } from '@common/balances/types';
import { Paths } from '@/common/routing';
import { getPrice } from '@/common/utils/coingecko';
import { BodyText, CaptionText, AssetsList, Plate, Price, IconButton, LargeTitleText, GiftModal } from '@/components';

export const DashboardMain = () => {
  const navigate = useNavigate();
  const { getAllChains } = useChainRegistry();
  const { subscribeBalance } = useBalances();
  const { publicKey, assets, assetsPrices, setAssets, setAssetsPrices } = useGlobalContext();
  const { user, MainButton, BackButton } = useTelegram();
  const isGiftsInfo = secureLocalStorage.getItem('GIFT_STORE');

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
          asset: chain.assets[0],
          addressPrefix: chain.addressPrefix,
        };
        const address = encodeAddress(publicKey, chain.addressPrefix);

        if (!assets.length) {
          setAssets((prevAssets) => [...prevAssets, { ...account, address }]);
        }

        subscribeBalance(account, (balance: IAssetBalance) => {
          console.info(`${address} ${chain.name} => balance: ${balance.total()}`);
          setAssets((prevAssets) => updateAssetsBalance(prevAssets, chain, balance));
        });
      }

      if (!assetsPrices) {
        const ids = chains.map((i) => i.assets[0].priceId);
        const prices = await getPrice(ids);
        setAssetsPrices(prices);
      }

      setAssets((prevAssets) => prevAssets.sort((a, b) => a.asset.symbol.localeCompare(b.asset.symbol)));
    })();
  }, [publicKey]);

  function clearWallet(clearLocal?: boolean) {
    resetWallet(clearLocal);
    navigate(Paths.ONBOARDING);
  }

  return (
    <div className="flex flex-col break-all">
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-6">
        <Avatar src={user?.photo_url} className="w-10 h-10" name={user?.first_name[0]} />
        <CaptionText className="self-center">Hello, {user?.first_name || 'friend'}</CaptionText>
        <IconButton iconName="settings" onClick={() => navigate(Paths.SETTINGS)} />
      </div>
      <Plate className="flex flex-col items-center mb-2 rounded-3xl">
        <BodyText className="text-text-hint">Total Balance</BodyText>
        <LargeTitleText>
          <Price amount={getTotalBalance(assets, assetsPrices)} />
        </LargeTitleText>
        <div className="grid grid-cols-3 w-full justify-items-center mt-4">
          <IconButton text="Send" iconName="send" color="primary" onClick={() => navigate(Paths.TRANSFER)} />
          <IconButton text="Receive" iconName="receive" color="success" onClick={() => navigate(Paths.RECEIVE)} />
          <IconButton text="Buy" iconName="buy" color="secondary" onClick={() => {}} />
        </div>
      </Plate>
      {isGiftsInfo && (
        <Button
          variant="light"
          size="lg"
          className="w-full bg-gradient-to-tr from-yellow-500 to-pink-500 text-white shadow-lg h-[50px]"
          onClick={() => navigate(Paths.GIFTS)}
        >
          Gifts
        </Button>
      )}
      <Plate className="flex flex-col my-2 rounded-3xl">
        <CaptionText>Assets</CaptionText>
        <AssetsList />
      </Plate>
      <GiftModal />

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
