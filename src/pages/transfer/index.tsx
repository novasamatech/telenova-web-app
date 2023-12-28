'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTelegram } from '@common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { Icon, Plate, TitleText, BodyText, HelpText } from '@/components';
import { useGlobalContext } from '@/common/providers/contextProvider';

export default function TransferPage() {
  const router = useRouter();
  const { BackButton } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      router.push(Paths.DASHBOARD);
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <TitleText className="mt-10 mb-6">How to send tokens</TitleText>
      <Plate className="mb-2 rounded-lg">
        <Link
          href={Paths.TRANSFER_SELECT_TOKEN}
          className="w-full grid grid-cols-[auto,1fr,auto] items-center gap-4"
          onClick={() => setSelectedAsset({ isGift: true })}
        >
          <Icon name="user" className="w-10 h-10" />
          <div className="grid">
            <BodyText align="left">Send Gift</BodyText>
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
