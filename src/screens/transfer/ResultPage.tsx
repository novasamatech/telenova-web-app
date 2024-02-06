import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@common/providers/telegramProvider';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Paths } from '@/common/routing';
import { HeadlineText, TitleText } from '@/components';

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
    <div className="flex flex-col justify-center ">
      <TitleText>
        {selectedAsset?.amount} {selectedAsset?.asset?.symbol} Sent to
      </TitleText>
      <HeadlineText className="text-text-hint m-3 break-all" align="center">
        {selectedAsset?.destinationAddress}
      </HeadlineText>
      <HeadlineText className="text-text-hint" align="center">
        Your transaction has been sent to the network and will be processed in a few seconds.
      </HeadlineText>
    </div>
  );
}
