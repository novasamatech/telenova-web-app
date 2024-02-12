import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { LinkCard, Plate } from '@/components';

export default function SettingsPage() {
  const { BackButton } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.DASHBOARD);
    BackButton?.onClick(callback);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <LinkCard text="Manage Backup" iconName="backup" iconClassName="w-6 h-6" showArrow href={Paths.SETTINGS_BACKUP} />
      <Plate className="w-full p-0 opacity-50">
        <LinkCard
          text="Wallet Language"
          iconName="language"
          iconClassName="w-6 h-6"
          valueText="English"
          className="grid-flow-col cursor-default"
          wrapperClassName="hover:bg-unset active:bg-unset"
          showArrow
        />
        <Divider className="h-[0.5px] ml-14 w-auto" />
        <LinkCard
          text="Default Currency"
          iconName="currency"
          iconClassName="w-6 h-6"
          className="grid-flow-col cursor-default"
          wrapperClassName="hover:bg-unset active:bg-unset"
          valueText="USD"
          showArrow
        />
      </Plate>
      <LinkCard text="Migrate to Nova Wallet" iconName="novaWallet" iconClassName="w-6 h-6" />
      <Plate className="w-full p-0">
        <LinkCard
          text="Telegram Community"
          iconName="telegram"
          iconClassName="w-6 h-6"
          wrapperClassName="rounded-b-none"
          showArrow
        />
        <Divider className="h-[0.5px] ml-14 w-auto" />
        <LinkCard
          text="X (Twitter)"
          iconName="twitter"
          iconClassName="w-6 h-6"
          wrapperClassName="rounded-none"
          showArrow
        />
        <Divider className="h-[0.5px] ml-14 w-auto" />
        <LinkCard
          text="YouTube"
          iconName="youtube"
          iconClassName="w-6 h-6"
          wrapperClassName="rounded-t-none"
          showArrow
        />
      </Plate>
      <Plate className="w-full p-0">
        <LinkCard
          text="Legal Information"
          className="grid-cols-[1fr,auto]"
          textClassName="text-text-link"
          wrapperClassName="rounded-b-none"
          showArrow
        />
        <Divider className="h-[0.5px] ml-4 w-auto" />
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
