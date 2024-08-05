import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button, Divider } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { getPrice, getTotalBalance } from '@/common/utils';
import { getMnemonic, resetWallet } from '@/common/wallet';
import {
  AssetsList,
  CreatedGiftPlate,
  GiftModal,
  HeadlineText,
  Icon,
  IconButton,
  LargeTitleText,
  LinkButton,
  MediumTitle,
  Plate,
  Price,
  TextBase,
  TitleText,
} from '@/components';
import { balancesModel, networkModel } from '@/models';

const Page = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { assetsPrices, setAssetsPrices } = useGlobalContext();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$sortedAssets);
  const balances = useUnit(balancesModel.$balances);

  // Fetching chains
  useEffect(() => {
    if (getMnemonic()) return;

    clearWallet(true);
  }, []);

  const clearWallet = (clearLocal?: boolean) => {
    resetWallet(clearLocal);
    navigate($path('/onboarding'));
  };

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

  const totalBalance = getTotalBalance(chains, balances, assetsPrices);

  return (
    <>
      <BackButton hidden />
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
            <Price amount={totalBalance} decimalSize="lg" />
          </LargeTitleText>
          <div className="grid grid-cols-3 w-full mt-7 gap-2">
            <IconButton text="Send" iconName="Send" onClick={() => navigate($path('/transfer'))} />
            <IconButton text="Receive" iconName="Receive" onClick={() => navigate($path('/receive/token-select'))} />
            <IconButton text="Buy/Sell" iconName="BuySell" onClick={() => navigate($path('/exchange'))} />
          </div>
        </div>

        <CreatedGiftPlate />

        <Plate className="flex flex-col my-2 rounded-3xl border-1 border-border-neutral">
          <TitleText align="left">Assets</TitleText>
          <div className="flex flex-col gap-y-6 mt-4">
            <AssetsList showPrice animate className="m-1" chains={chains} assets={assets} balances={balances} />
          </div>
        </Plate>

        <LinkButton
          className="mx-auto my-5"
          href={$path('/assets')}
          prefixIcon={<Icon className="text-inherit" name="Plus" size={16} />}
        >
          Manage tokens
        </LinkButton>

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
    </>
  );
};

export default Page;
