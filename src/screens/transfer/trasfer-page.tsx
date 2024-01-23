'use client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { Plate, TitleText, LinkCard } from '@/components';

export default function TransferPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const callback = () => {
      navigate(Paths.DASHBOARD);
    };
    BackButton?.show();
    BackButton?.onClick(callback);

    return () => {
      BackButton?.hide();
      BackButton?.offClick(callback);
    };
  }, []);

  return (
    <>
      <TitleText className="mt-10 mb-6">How to send tokens</TitleText>
      <Plate className="mb-2 p-2">
        <LinkCard
          href={Paths.TRANSFER_SELECT_TOKEN}
          text="Send as Gift"
          helpText="Transfer to one of your contacts"
          iconName="gift"
          className="p-0"
          showArrow
          onClick={() => setSelectedAsset({ isGift: true })}
        />
      </Plate>
      <Plate className="p-2">
        <LinkCard
          href={Paths.TRANSFER_SELECT_TOKEN}
          text="External Address"
          helpText="Transfer to address within the network"
          iconName="address"
          className="p-0"
          showArrow
          onClick={() => setSelectedAsset(null)}
        />
      </Plate>
    </>
  );
}
