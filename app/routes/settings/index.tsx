import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Divider, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { openLink } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton';
import { HelpText, Icon, LinkCard, MediumTitle, Plate, TextBase } from '@/components';
import { telegramModel } from '@/models/telegram';

export const loader = () => {
  return json({
    version: process.env.PUBLIC_APP_VERSION,
  });
};

const Page = () => {
  const { version } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [isPopoverCurrencyOpen, setIsPopoverCurrencyOpen] = useState(false);
  const [isPopoverLanguageOpen, setIsPopoverLanguageOpen] = useState(false);

  if (!webApp) return null;

  const handleOpenChange = (stateFunc: (state: boolean) => void) => {
    stateFunc(true);

    setTimeout(() => {
      stateFunc(false);
    }, 1000);
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
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
          className="relative min-h-[150px] w-full rounded-2xl bg-[url('/assets/misc/nova-wallet.webp')] bg-cover"
          onClick={() => openLink('https://novawallet.io', webApp)}
        >
          <div className="absolute right-[5%] top-[10%] w-[60%] break-words">
            <TextBase as="p" align="right" className="mb-4 text-body-bold text-white">
              Upgrade to Nova Wallet!
            </TextBase>
            <HelpText className="font-semibold text-white">
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
            onClick={() => openLink('https://novasama.io/telenova/privacy', webApp)}
          />
          <Divider className="ml-4 h-[0.5px] w-auto border-solid" />
          <LinkCard
            text="Terms & Conditions"
            className="grid-cols-[1fr,auto]"
            textClassName="text-text-link"
            wrapperClassName="rounded-t-none"
            showArrow
            onClick={() => openLink('https://novasama.io/telenova/terms', webApp)}
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
