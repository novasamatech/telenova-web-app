import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { isOpenInWeb } from '@/common/telegram';
import { useMainButton } from '@/common/telegram/useMainButton';
import { handleWidget } from '@/common/utils/exchange';
import { MediumTitle } from '@/components/Typography';

export default function MercuryoWidgetPage() {
  const { BackButton, webApp } = useTelegram();
  const navigate = useNavigate();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);
  const { hideMainButton, addMainButton } = useMainButton();

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate($path('/exchange/select'));
    BackButton?.onClick(callback);
    if (!selectedAsset || isOpenInWeb(webApp!.platform)) {
      return;
    }

    handleWidget(selectedAsset, handleStatus, handleSell);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);
  useEffect(() => {
    if (isSendBtnVisible) {
      addMainButton(() => {
        navigate($path('/transfer/amount'));
      }, `Send ${selectedAsset?.asset?.symbol} to sell`);
    }

    return () => {
      hideMainButton();
    };
  }, [isSendBtnVisible]);

  const handleStatus = (data: any) => {
    if (data.status === 'paid' || data.status === 'new') {
      BackButton?.onClick(() => navigate($path('/dashboard')));
    }
  };

  const handleSell = (data: any) => {
    setIsSendBtnVisible(true);
    setSelectedAsset(prev => ({ ...prev, destinationAddress: data.address, amount: data.amount }));
  };

  return (
    <>
      <div className="w-full h-[95svh]" id="mercuryo-widget">
        {isOpenInWeb(webApp?.platform) && (
          <div>
            <MediumTitle align="center">
              Sorry, the widget is not supported in the web version. Proceed with the application.
            </MediumTitle>
          </div>
        )}
      </div>
    </>
  );
}
