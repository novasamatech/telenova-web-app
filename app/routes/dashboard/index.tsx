import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button, Divider } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { isEmpty } from 'lodash-es';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { getMnemonic, resetWallet } from '@/common/wallet';
import { balancesModel } from '@/models/balances';
import { networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';
import { telegramModel } from '@/models/telegram';
import { getTotalBalance } from '@/shared/helpers';
import { useToggle } from '@/shared/hooks';
import {
  BodyText,
  HeadlineText,
  Icon,
  IconButton,
  LargeTitleText,
  LinkButton,
  MediumTitle,
  Plate,
  Price,
  Shimmering,
  TextBase,
  TitleText,
} from '@/ui/atoms';
import { AssetSkeleton, AssetsList, CreatedGiftPlate, GiftClaim, MercuryoWarning } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const balances = useUnit(balancesModel.$balances);
  const prices = useUnit(pricesModel.$prices);
  const [webApp, user] = useUnit([telegramModel.$webApp, telegramModel.$user]);
  const [chains, assets, isChainsLoading] = useUnit([
    networkModel.$chains,
    networkModel.$sortedAssets,
    networkModel.isChainsLoading,
  ]);

  const [isWarningOpen, toggleWarning] = useToggle();

  useEffect(() => {
    if (!webApp || getMnemonic(webApp)) return;

    clearWallet(true);
  }, [webApp]);

  const clearWallet = (clearLocal?: boolean) => {
    resetWallet(clearLocal);
    navigate($path('/onboarding'));
  };

  const navigateToMercuryo = () => {
    if (!webApp) return;

    if (webApp.platform === 'weba' || webApp.platform === 'webk') {
      toggleWarning();
    } else {
      navigate($path('/exchange'));
    }
  };

  const totalBalance = getTotalBalance(chains, balances, prices);

  return (
    <>
      <BackButton hidden />
      <div className="flex flex-col break-words">
        <div className="mb-6 grid grid-cols-[auto,1fr,auto] items-center gap-2">
          <Avatar
            src={user?.photo_url}
            className="h-10 w-10"
            name={user?.first_name.charAt(0)}
            classNames={{
              base: 'bg-[--tg-theme-button-color]',
              name: 'font-manrope font-black text-base text-white',
            }}
          />
          <MediumTitle className="self-center">Hello, {user?.first_name || 'friend'}</MediumTitle>
          <Button
            isIconOnly
            className="overflow-visible bg-transparent drop-shadow-button"
            onClick={() => navigate($path('/settings'))}
          >
            <Icon name="Settings" size={40} className="text-[--tg-theme-button-color]" />
          </Button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <HeadlineText className="mb-1 text-text-hint">Total Balance</HeadlineText>
          <LargeTitleText>
            <Price amount={totalBalance} decimalSize="lg" />
          </LargeTitleText>
          <div className="mt-7 grid w-full grid-cols-3 gap-2">
            <IconButton text="Send" iconName="Send" onClick={() => navigate($path('/transfer'))} />
            <IconButton text="Receive" iconName="Receive" onClick={() => navigate($path('/receive/token-select'))} />
            <IconButton text="Buy/Sell" iconName="BuySell" onClick={navigateToMercuryo} />
          </div>
        </div>

        <CreatedGiftPlate />

        {isChainsLoading && (
          <Plate className="my-2 flex flex-col rounded-3xl border-1 border-border-neutral">
            <Shimmering width={100} height={32} />
            <div className="mt-6 flex flex-col gap-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <AssetSkeleton key={index} />
              ))}
            </div>
          </Plate>
        )}

        {!isChainsLoading && !isEmpty(chains) && (
          <>
            <Plate className="my-2 flex flex-col rounded-3xl border-1 border-border-neutral">
              <TitleText align="left">Assets</TitleText>
              <div className="mt-6 flex flex-col gap-y-6">
                <AssetsList showPrice animate chains={chains} assets={assets} prices={prices} balances={balances} />
              </div>
            </Plate>

            <LinkButton
              className="mx-auto my-5"
              href={$path('/assets')}
              prefixIcon={<Icon className="text-inherit" name="Plus" size={16} />}
            >
              Manage tokens
            </LinkButton>
          </>
        )}

        {!isChainsLoading && isEmpty(chains) && (
          <div className="mt-10 flex flex-col items-center gap-y-4">
            <Icon name="NoResult" size={180} />
            <BodyText className="max-w-[225px] text-text-hint">
              Failed to load assets
              <br />
              Try to reopen the application
            </BodyText>
          </div>
        )}

        <GiftClaim />
        <MercuryoWarning isOpen={isWarningOpen} onClose={toggleWarning} />

        {import.meta.env.DEV && (
          <div className="mt-10 flex flex-col justify-center gap-2 rounded-lg bg-warning p-4">
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
