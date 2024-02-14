import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { Icon, MediumTitle, TitleText } from '@/components';

export default function ResultPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { hideMainButton, addMainButton, mainButton } = useMainButton();

  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    BackButton?.hide();
    mainButton.show();
    const callback = () => {
      navigate(Paths.DASHBOARD, { replace: true });
    };
    addMainButton(callback, 'Done');

    return () => {
      hideMainButton();
      setSelectedAsset(null);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[95vh] gap-3">
      <Icon name="Success" size={250} />
      <TitleText>
        {selectedAsset?.amount} {selectedAsset?.asset?.symbol} Sent to
      </TitleText>
      <MediumTitle className="text-text-hint break-all" align="center">
        {selectedAsset?.destinationAddress}
      </MediumTitle>
      <MediumTitle className="text-text-hint" align="center">
        Your transaction has been sent to the network and will be processed in a few seconds.
      </MediumTitle>
    </div>
  );
}
