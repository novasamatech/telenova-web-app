import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { HelpText, Icon, LinkCard, Plate, TextBase } from '@/components';

export default function SettingsPage() {
  const { BackButton, webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.DASHBOARD);
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);
  const handleClick = () => {
    webApp?.openLink('https://novawallet.io');
    webApp?.close();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <LinkCard text="Manage Backup" iconName="Backup" iconClassName="w-6 h-6" showArrow href={Paths.SETTINGS_BACKUP} />
      <Plate className="w-full p-0 opacity-50">
        <LinkCard
          text="Wallet Language"
          iconName="Language"
          iconClassName="w-6 h-6"
          valueText="English"
          className="grid-flow-col cursor-default pointer-events-none"
          wrapperClassName="hover:bg-unset active:bg-unset"
          showArrow
        />
        <Divider className="h-[0.5px] ml-14 w-auto" />
        <LinkCard
          text="Default Currency"
          iconName="Currency"
          iconClassName="w-6 h-6"
          className="grid-flow-col cursor-default pointer-events-none"
          wrapperClassName="hover:bg-unset active:bg-unset"
          valueText="USD"
          showArrow
        />
      </Plate>
      <button
        className="w-full h-[150px] bg-[url('/images/nova.png')] bg-cover rounded-2xl relative"
        onClick={handleClick}
      >
        <div className="absolute right-[5%] top-[10%]">
          <TextBase as="p" align="right" className="text-body-bold text-white mb-4">
            Migrate to Nova Wallet!
          </TextBase>
          <div className="flex items-center gap-2">
            <Icon name="Star" className="w-[10px] h-[10px]" />
            <HelpText className="text-white font-semibold">350+ Tokens to choose</HelpText>
          </div>
          <div className="flex items-center gap-2 my-3">
            <Icon name="Star" className="w-[10px] h-[10px]" />
            <HelpText className="text-white font-semibold">90+ Networks</HelpText>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Star" className="w-[10px] h-[10px]" />
            <HelpText className="text-white font-semibold">Super Simple Staking</HelpText>
          </div>
        </div>
      </button>
      <Plate className="w-full p-0">
        <LinkCard
          text="Legal Information"
          className="grid-cols-[1fr,auto]"
          textClassName="text-text-link"
          wrapperClassName="rounded-b-none"
          showArrow
        />
        <Divider className="h-[0.5px] ml-4 w-auto border-solid" />
        <LinkCard
          text="User Agreement"
          className="grid-cols-[1fr,auto]"
          textClassName="text-text-link"
          wrapperClassName="rounded-t-none"
          showArrow
        />
      </Plate>
    </div>
  );
}
