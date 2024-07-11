import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button, Divider } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { useBalances } from '@/common/balances';
import { networkModel } from '@/common/network/network-model.ts';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { getPrice, getTotalBalance, mapAssetAccountsFromChains, updateAssetsBalance } from '@/common/utils';
import { getMnemonic, resetWallet } from '@/common/wallet';
import {
  AssetsList,
  CreatedGiftPlate,
  GiftModal,
  HeadlineText,
  Icon,
  IconButton,
  LargeTitleText,
  MediumTitle,
  Plate,
  Price,
  TextBase,
  TitleText,
} from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const { subscribeBalance, unsubscribeBalance } = useBalances();
  const { publicKey, assets, assetsPrices, setAssets, setAssetsPrices } = useGlobalContext();
  const { user } = useTelegram();

  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  function clearWallet(clearLocal?: boolean) {
    resetWallet(clearLocal);
    navigate($path('/onboarding'));
  }

  // Fetching chains
  useEffect(() => {
    if (getMnemonic()) return;

    clearWallet(true);
  }, []);

  // Mapping assets
  useEffect(() => {
    if (!publicKey) return;

    setAssets(mapAssetAccountsFromChains(Object.values(chains), publicKey));
  }, [chains, publicKey]);

  // Subscribing balances
  useEffect(() => {
    if (!publicKey) return;

    const assets = mapAssetAccountsFromChains(Object.values(chains), publicKey);
    const unsubscribeIds = assets.map(asset =>
      subscribeBalance(asset, balance => {
        setAssets(prevAssets => updateAssetsBalance(prevAssets, asset.chainId, balance));
      }),
    );

    return () => {
      unsubscribeIds.forEach(unsubscribeBalance);
    };
  }, [connections, chains, publicKey]);

  // Fetching prices
  useEffect(() => {
    if (Object.keys(chains).length === 0) return;

    const abortController = new AbortController();
    getPrice({
      ids: Object.values(chains)
        .flatMap(chain => chain.assets.map(a => a.priceId))
        .filter(priceId => priceId !== undefined),
      abortSignal: abortController.signal,
    }).then(setAssetsPrices);

    return () => {
      abortController.abort();
    };
  }, [chains]);

  return (
    <div className="flex flex-col break-words">
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-6 items-center">
        <Avatar
          src={user?.photo_url}
          className="w-10 h-10"
          name={user?.first_name.charAt(0)}
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
        />
        <MediumTitle className="self-center">Hello, {user?.first_name || 'friend'}</MediumTitle>
        <Button
          isIconOnly
          className="bg-transparent overflow-visible drop-shadow-button"
          onClick={() => navigate($path('/settings'))}
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
          <IconButton text="Send" iconName="Send" onClick={() => navigate($path('/transfer'))} />
          <IconButton text="Receive" iconName="Receive" onClick={() => navigate($path('/receive/token-select'))} />
          <IconButton text="Buy/Sell" iconName="BuySell" onClick={() => navigate($path('/exchange'))} />
        </div>
      </div>
      <CreatedGiftPlate />
      <Plate className="flex flex-col my-2 rounded-3xl">
        <TitleText align="left">Assets</TitleText>
        <div className="flex flex-col gap-6 mt-4">
          <AssetsList className="m-1" assets={assets} showPrice animate />
        </div>
      </Plate>
      <GiftModal />

      {import.meta.env.DEV && (
        <div className="p-4 flex flex-col gap-2 justify-center bg-warning rounded-lg">
          <TextBase className="text-amber-50">DEV MODE</TextBase>
          <Divider className="bg-amber-200" />
          <Button variant="faded" onClick={() => clearWallet()}>
            Reset Wallet
          </Button>
          <Button variant="faded" onClick={() => clearWallet(true)}>
            Reset Wallet Local
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
