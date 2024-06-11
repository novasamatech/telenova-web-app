import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encodeAddress } from '@polkadot/util-crypto';
import { Avatar, Button } from '@nextui-org/react';

import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { useBalances, IAssetBalance } from '@common/balances';
import { useChainRegistry } from '@common/chainRegistry';
import { getMnemonic, resetWallet } from '@common/wallet';
import { ChainAssetAccount } from '@common/types';
import { Paths } from '@/common/routing';
import { sortingAssets, getPrice, getTotalBalance, updateAssetsBalance } from '@/common/utils';
import {
  MediumTitle,
  AssetsList,
  Plate,
  Price,
  IconButton,
  LargeTitleText,
  GiftModal,
  CreatedGiftPlate,
  HeadlineText,
  TitleText,
  Icon,
} from '@/components';

export const DashboardMain = () => {
  const navigate = useNavigate();
  const { getAllChains } = useChainRegistry();
  const { subscribeBalance } = useBalances();
  const { publicKey, assets, assetsPrices, setAssets, setAssetsPrices } = useGlobalContext();
  const { user, BackButton } = useTelegram();
  const { hideMainButton } = useMainButton();

  function clearWallet(clearLocal?: boolean) {
    resetWallet(clearLocal);
    navigate(Paths.ONBOARDING);
  }

  useEffect(() => {
    hideMainButton();
    BackButton?.hide();
    if (!getMnemonic()) {
      clearWallet(true);

      return;
    }
    if (!publicKey) return;

    (async () => {
      const chains = await getAllChains();
      console.info(`Found all ${chains.length} chains`);

      for (const chain of chains) {
        const account: ChainAssetAccount = {
          chainId: chain.chainId,
          publicKey: publicKey,
          chainName: chain.name,
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

      setAssets((prevAssets) => prevAssets.sort((a, b) => sortingAssets(a.asset, b.asset)));
    })();
  }, [publicKey]);

  return (
    <div className="flex flex-col break-words">
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-6 items-center">
        <Avatar
          src={user?.photo_url}
          className="w-10 h-10"
          name={user?.first_name[0]}
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
        />
        <MediumTitle className="self-center">Hello, {user?.first_name || 'friend'}</MediumTitle>
        <Button
          isIconOnly
          className="bg-transparent overflow-visible drop-shadow-button"
          onClick={() => navigate(Paths.SETTINGS)}
        >
          <Icon name="Settings" size={40} className="text-[--tg-theme-button-color]" />
        </Button>
      </div>
      <div className="flex flex-col mt-4 items-center">
        <HeadlineText className="text-text-hint mb-1">Total Balance</HeadlineText>
        <LargeTitleText>
          <Price amount={getTotalBalance(assets, assetsPrices)} decimalSize={32} />
        </LargeTitleText>
        <div className="grid grid-cols-3 w-full mt-7 gap-2">
          <IconButton text="Send" iconName="Send" onClick={() => navigate(Paths.TRANSFER)} />
          <IconButton text="Receive" iconName="Receive" onClick={() => navigate(Paths.RECEIVE_SELECT_TOKEN)} />
          <IconButton text="Buy/Sell" iconName="BuySell" onClick={() => navigate(Paths.EXCHANGE)} />
        </div>
      </div>
      <CreatedGiftPlate />
      <Plate className="flex flex-col my-2 rounded-3xl">
        <TitleText align="left">Assets</TitleText>
        <AssetsList />
      </Plate>
      <GiftModal />

      {process.env.NODE_ENV === 'development' && (
        <>
          <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
            Reset Wallet
          </button>
          <button className="btn btn-blue mt-4" onClick={() => clearWallet(true)}>
            Reset Wallet Local
          </button>
        </>
      )}
    </div>
  );
};
