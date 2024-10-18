import { Avatar, Button, Divider } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { isEmpty } from 'lodash-es';
import { $path } from 'remix-routes';

import { balancesModel } from '@/models/balances';
import { navigationModel } from '@/models/navigation';
import { networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';
import { walletModel } from '@/models/wallet';
import { BackButton, TelegramApi } from '@/shared/api';
import { getTotalFiatBalance } from '@/shared/helpers';
import { useToggle } from '@/shared/hooks';
import {
  AccountPrice,
  BodyText,
  HeadlineText,
  Icon,
  IconButton,
  LinkButton,
  MediumTitle,
  Plate,
  Shimmering,
  TextBase,
  TitleText,
} from '@/ui/atoms';
import { AssetSkeleton, AssetsList, CreatedGiftPlate, GiftClaim, MercuryoWarning } from '@/ui/molecules';

const Page = () => {
  const balances = useUnit(balancesModel.$balances);
  const prices = useUnit(pricesModel.$prices);
  const [chains, assets, isChainsLoading] = useUnit([
    networkModel.$chains,
    networkModel.$sortedAssets,
    networkModel.isChainsLoading,
  ]);

  const [isWarningOpen, toggleWarning] = useToggle();

  const user = TelegramApi.initDataUnsafe.user;

  const clearWallet = (clearRemote = false) => {
    walletModel.input.walletCleared({ clearRemote });

    const path = clearRemote ? $path('/onboarding') : $path('/onboarding/restore');
    navigationModel.input.navigatorPushed({ type: 'navigate', to: path });
  };

  const navigateToMercuryo = () => {
    if (TelegramApi.isWebPlatform) {
      toggleWarning();
    } else {
      navigationModel.input.navigatorPushed({ type: 'navigate', to: $path('/exchange') });
    }
  };

  return (
    <>
      <BackButton hidden />
      <div className="flex flex-col break-words">
        <div className="mb-8 grid grid-cols-[auto,1fr,auto] items-center gap-2">
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
            onClick={() => navigationModel.input.navigatorPushed({ type: 'navigate', to: $path('/settings') })}
          >
            <Icon name="Settings" size={40} className="text-[--tg-theme-button-color]" />
          </Button>
        </div>

        <div className="mb-6 flex flex-col items-center">
          <HeadlineText className="mb-1 text-text-hint">Total Balance</HeadlineText>
          <AccountPrice amount={getTotalFiatBalance(chains, balances, prices)?.toFixed(2)} />
          <div className="mt-7 grid w-full grid-cols-3 gap-2">
            <IconButton
              text="Send"
              iconName="Send"
              onClick={() => navigationModel.input.navigatorPushed({ type: 'navigate', to: $path('/transfer') })}
            />
            <IconButton
              text="Receive"
              iconName="Receive"
              onClick={() =>
                navigationModel.input.navigatorPushed({ type: 'navigate', to: $path('/receive/token-select') })
              }
            />
            <IconButton text="Buy/Sell" iconName="BuySell" onClick={navigateToMercuryo} />
          </div>
        </div>

        <CreatedGiftPlate className="mb-2" />

        {isChainsLoading && (
          <Plate className="mb-2 flex flex-col rounded-3xl border-1 border-border-neutral">
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
            <Plate className="mb-2 flex flex-col rounded-3xl border-1 border-border-neutral">
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
            <Button variant="faded" onClick={() => clearWallet(true)}>
              Reset Wallet
            </Button>
            <Button variant="faded" onClick={() => clearWallet()}>
              Reset Wallet Local
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
