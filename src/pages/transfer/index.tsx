'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { Icon, Plate, TitleText, BodyText, HelpText } from '@/components';

export default function TransferPage() {
  const router = useRouter();
  const { BackButton } = useTelegram();

  useEffect(() => {
    BackButton?.show();
    BackButton?.onClick(() => {
      router.push(Paths.DASHBOARD);
    });

    return () => {
      BackButton?.hide();
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <TitleText className="mt-10 mb-6">How to send tokens</TitleText>
      <Plate className="mb-2 rounded-lg">
        <Link href={''} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
          <Icon name="user" className="w-10 h-10" />
          <div className="grid">
            <BodyText align="left">Telegram Contact</BodyText>
            <HelpText className="text-text-hint">Transfer to one of your contacts</HelpText>
          </div>
          <Icon name="chevronForward" className="w-4 h-4" />
        </Link>
      </Plate>

      <Plate className="rounded-lg">
        <Link href={Paths.TRANSFER_SELECT_TOKEN} className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4">
          <Icon name="address" className="w-10 h-10" />
          <div className="grid">
            <BodyText align="left" as="span">
              External Address
            </BodyText>
            <HelpText className="text-text-hint">Transfer to address within the network</HelpText>
          </div>
          <Icon name="chevronForward" className="w-4 h-4" />
        </Link>
      </Plate>
    </div>
  );
}
