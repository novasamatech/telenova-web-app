import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { MediumTitle, TitleText } from '@/components';

export default function ResultPage() {
  const navigate = useNavigate();
  const { BackButton, MainButton } = useTelegram();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    MainButton?.setText('Done');
    BackButton?.hide();
    MainButton?.show();
    const callback = () => {
      navigate(Paths.DASHBOARD, { replace: true });
    };
    MainButton?.onClick(callback);

    return () => {
      MainButton?.hide();
      MainButton?.setText('Continue');
      MainButton?.offClick(callback);
      setSelectedAsset(null);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
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
