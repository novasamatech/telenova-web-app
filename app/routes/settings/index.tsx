import { useState } from 'react';

import { Divider, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { $path } from 'remix-routes';

import { navigationModel } from '@/models/navigation';
import { TelegramApi, keyringApi, localStorageApi } from '@/shared/api';
import { BackButton } from '@/shared/api/telegram/ui/BackButton.tsx';
import { MNEMONIC_STORE } from '@/shared/helpers';
import { BodyText, HelpText, Icon, MediumTitle, Plate } from '@/ui/atoms';
import { LinkCard } from '@/ui/molecules';

export const loader = () => {
  return json({
    version: process.env.PUBLIC_APP_VERSION,
  });
};

const Page = () => {
  const { version } = useLoaderData<typeof loader>();

  const [isPopoverCurrencyOpen, setIsPopoverCurrencyOpen] = useState(false);
  const [isPopoverLanguageOpen, setIsPopoverLanguageOpen] = useState(false);

  const handleOpenChange = (stateFunc: (state: boolean) => void) => {
    stateFunc(true);

    setTimeout(() => {
      stateFunc(false);
    }, 1000);
  };

  const migrateToNovaWallet = () => {
    const mnemonicStore = TelegramApi.getStoreName(MNEMONIC_STORE);
    const mnemonic = localStorageApi.secureGetItem(mnemonicStore, '');
    const entropy = keyringApi.getMnemonicEntropy(mnemonic);

    TelegramApi.openLink(`https://app.novawallet.io/create/wallet?mnemonic=${entropy}`);
  };

  return (
    <>
      <BackButton onClick={() => navigationModel.input.navigatorPushed({ type: 'history', delta: -1 })} />
      <div className="flex min-h-[95vh] flex-col items-center gap-4">
        <LinkCard
          text="Manage Backup"
          iconName="Backup"
          iconClassName="w-6 h-6"
          showArrow
          href={$path('/settings/backup')}
        />
        <Plate className="w-full p-0">
          <Popover
            offset={-20}
            placement="top"
            triggerScaleOnOpen={false}
            isOpen={isPopoverLanguageOpen}
            classNames={{
              content: ['py-3 px-4 rounded-2xl', 'opacity-50 bg-[#161922]'],
            }}
            onOpenChange={() => handleOpenChange(setIsPopoverLanguageOpen)}
          >
            <PopoverTrigger>
              <button className="hover:bg-unset active:bg-unset h-full w-full outline-none">
                <LinkCard
                  text="Wallet Language"
                  iconName="Language"
                  iconClassName="w-6 h-6"
                  valueText="English"
                  className="grid-flow-col"
                  showArrow
                />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <MediumTitle className="text-white">Coming soon</MediumTitle>
            </PopoverContent>
          </Popover>
          <Divider className="ml-14 h-[0.5px] w-auto" />
          <Popover
            offset={-25}
            placement="top"
            triggerScaleOnOpen={false}
            isOpen={isPopoverCurrencyOpen}
            classNames={{
              content: ['py-3 px-4 rounded-2xl', 'opacity-50 bg-[#161922]'],
            }}
            onOpenChange={() => handleOpenChange(setIsPopoverCurrencyOpen)}
          >
            <PopoverTrigger>
              <button className="hover:bg-unset active:bg-unset w-full outline-none">
                <LinkCard
                  text="Default Currency"
                  iconName="Currency"
                  iconClassName="w-6 h-6"
                  className="grid-flow-col"
                  valueText="USD"
                  showArrow
                />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <MediumTitle className="text-white">Coming soon</MediumTitle>
            </PopoverContent>
          </Popover>
        </Plate>

        <button
          className="flex h-[108px] w-full overflow-hidden rounded-2xl bg-[url('/assets/misc/gradient.avif')] bg-[25%_25%]"
          onClick={migrateToNovaWallet}
        >
          <img src="/assets/misc/phone.avif" alt="" className="ml-6 mt-1.5 w-[106px]" />
          <div className="mx-auto flex w-[190px] flex-col gap-y-4 self-center">
            <BodyText className="-indent-1 text-body-bold text-white">Upgrade to Nova Wallet!</BodyText>
            <HelpText className="text-balance font-semibold text-white">
              Earn up to <b>20% APY</b> using the Polkadot’s best wallet
            </HelpText>
          </div>
        </button>
        <Plate className="w-full p-0">
          <LinkCard
            text="Privacy Policy"
            className="grid-cols-[1fr,auto]"
            textClassName="text-text-link"
            wrapperClassName="rounded-b-none"
            showArrow
            onClick={() => TelegramApi.openLink('https://novasama.io/telenova/privacy')}
          />
          <Divider className="ml-4 h-[0.5px] w-auto border-solid" />
          <LinkCard
            text="Terms & Conditions"
            className="grid-cols-[1fr,auto]"
            textClassName="text-text-link"
            wrapperClassName="rounded-t-none"
            showArrow
            onClick={() => TelegramApi.openLink('https://novasama.io/telenova/terms')}
          />
        </Plate>
        <div className="mt-auto flex flex-col items-center">
          <HelpText className="mb-2 text-[10px] text-icon-neutral">Telenova v{version}</HelpText>
          <HelpText className="mb-4 text-[10px] text-icon-neutral">Developed with love by</HelpText>
          <Icon name="Novasama" className="h-[50px] w-[66px]" />
        </div>
      </div>
    </>
  );
};

export default Page;
