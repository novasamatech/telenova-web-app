import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Divider, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { openLink } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton';
import { HelpText, Icon, LinkCard, MediumTitle, Plate, TextBase } from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const { webApp } = useTelegram();

  const [isPopoverCurrencyOpen, setIsPopoverCurrencyOpen] = useState(false);
  const [isPopoverLanguageOpen, setIsPopoverLanguageOpen] = useState(false);

  const handleOpenChange = (stateFunc: (state: boolean) => void) => {
    stateFunc(true);
    setTimeout(() => {
      stateFunc(false);
    }, 1000);
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <div className="flex flex-col items-center gap-4 min-h-[95vh]">
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
              <button className="w-full h-full hover:bg-unset active:bg-unset outline-none">
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
          <Divider className="h-[0.5px] ml-14 w-auto" />
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
              <button className="w-full hover:bg-unset active:bg-unset outline-none">
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
          className="w-full min-h-[150px] bg-[url('/images/nova.png')] bg-cover rounded-2xl relative"
          onClick={() => openLink('https://novawallet.io', webApp!)}
        >
          <div className="absolute right-[5%] top-[10%] break-words w-[60%]">
            <TextBase as="p" align="right" className="text-body-bold text-white mb-4">
              Upgrade to Nova Wallet!
            </TextBase>
            <HelpText className="text-white font-semibold">
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
            onClick={() => openLink('https://novasama.io/telenova/privacy', webApp!)}
          />
          <Divider className="h-[0.5px] ml-4 w-auto border-solid" />
          <LinkCard
            text="Terms & Conditions"
            className="grid-cols-[1fr,auto]"
            textClassName="text-text-link"
            wrapperClassName="rounded-t-none"
            showArrow
            onClick={() => openLink('https://novasama.io/telenova/terms', webApp!)}
          />
        </Plate>
        <div className="mt-auto grid gap-4 justify-items-center">
          <HelpText className="text-icon-neutral text-[10px]">Developed with love by</HelpText>
          <Icon name="Novasama" className="w-[66px] h-[50px]" />
        </div>
      </div>
    </>
  );
};

export default Page;
