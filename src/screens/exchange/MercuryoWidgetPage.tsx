import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { Paths } from '@/common/routing';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { handleWidget } from '@/common/utils/exchange';
import { isOpenInWeb } from '@/common/telegram';
import { MediumTitle } from '@/components/Typography';

export default function MercuryoWidgetPage() {
  const { BackButton, webApp } = useTelegram();
  const navigate = useNavigate();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.EXCHANGE_SELECT);
    BackButton?.onClick(callback);
    if (!selectedAsset || isOpenInWeb(webApp!.platform)) return;

    handleWidget(selectedAsset, handleStatus, handleSell);

    return () => {
      BackButton?.offClick(callback);
    };
  }, []);

  const handleStatus = (data: any) => {
    if (data.status === 'paid') {
      BackButton?.onClick(() => navigate(Paths.DASHBOARD));
    }
  };

  const handleSell = (data: any) => {
    setIsSendBtnVisible(true);
    setSelectedAsset((prev) => ({ ...prev, destinationAddress: data.address, amount: data.amount }));
  };

  return (
    <>
      {isSendBtnVisible && (
        <Button className="mb-2" color="primary" fullWidth onClick={() => navigate(Paths.TRANSFER_AMOUNT)}>
          Send it now
        </Button>
      )}
      <div className="w-full h-[95svh]" id="mercuryo-widget">
        {isOpenInWeb(webApp!.platform) && (
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
