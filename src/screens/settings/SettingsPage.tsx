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
      <Plate className="w-full p-0">
        <LinkCard
          text="Manage Backup"
          iconName="backup"
          iconClassName="w-6 h-6"
          showArrow
          href={Paths.SETTINGS_BACKUP}
        />
      </Plate>
      <Plate className="w-full p-0 bg-bg-button-disabled">
        <LinkCard
          text="Wallet Language"
          iconName="language"
          iconClassName="w-6 h-6"
          valueText="English"
          className="grid-flow-col cursor-default"
          showArrow
        />
        <Divider className="m-auto w-[85%]" />
        <LinkCard
          text="Default Currency"
          iconName="currency"
          iconClassName="w-6 h-6"
          className="grid-flow-col cursor-default"
          valueText="USD"
          showArrow
        />
      </Plate>
      <Plate className="w-full p-0">
        <LinkCard text="Migrate to Nova Wallet" iconName="novaWallet" iconClassName="w-6 h-6" />
      </Plate>
      <Plate className="w-full p-0">
        <LinkCard text="Telegram Community" iconName="telegram" iconClassName="w-6 h-6" showArrow />
        <Divider className="m-auto w-[85%]" />
        <LinkCard text="X (Twitter)" iconName="twitter" iconClassName="w-6 h-6" showArrow />
        <Divider className="m-auto w-[85%]" />
        <LinkCard text="YouTube" iconName="youtube" iconClassName="w-6 h-6" showArrow />
      </Plate>
      <Plate className="w-full p-0">
        <LinkCard text="Legal Information" className="grid-cols-[1fr,auto]" textClassName="text-text-link" showArrow />
        <Divider className="m-auto w-[85%]" />
        <LinkCard text="User Agreement" className="grid-cols-[1fr,auto]" textClassName="text-text-link" showArrow />
      </Plate>
    </div>
  );
}
