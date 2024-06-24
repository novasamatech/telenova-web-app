import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { isOpenInWeb } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { handleWidget } from '@/common/utils';
import { MediumTitle } from '@/components';

export const loader = () => {
  return json({
    mercuryoSecret: process.env.PUBLIC_WIDGET_SECRET,
    mercuryoWidgetId: process.env.PUBLIC_WIDGET_ID,
  });
};

const Page: FC = () => {
  const { mercuryoSecret, mercuryoWidgetId } = useLoaderData<typeof loader>();

  const [root, setRoot] = useState<HTMLElement | null>(null);
  const { webApp } = useTelegram();
  const navigate = useNavigate();
  const { selectedAsset, setSelectedAsset } = useGlobalContext();
  const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!selectedAsset || isOpenInWeb(webApp!.platform) || !root) {
      return;
    }

    handleWidget({
      root,
      returnPage: $path('/dashboard'),
      secret: mercuryoSecret,
      widgetId: mercuryoWidgetId,
      selectedAsset,
      handleStatus,
      handleSell,
    });
  }, [root]);

  const handleStatus = (data: any) => {
    if (data.status === 'paid' || data.status === 'new') {
      setDone(true);
    }
  };

  const handleSell = (data: any) => {
    setIsSendBtnVisible(true);
    setSelectedAsset(prev => ({ ...prev, destinationAddress: data.address, amount: data.amount }));
  };

  return (
    <>
      <MainButton
        text={`Send ${selectedAsset?.asset?.symbol} to sell`}
        hidden={!isSendBtnVisible}
        onClick={() => {
          if (selectedAsset && selectedAsset.address && selectedAsset.chainId && selectedAsset.asset?.assetId) {
            navigate(
              $path('/transfer/direct/:chainId/:assetId/:address/amount', {
                assetId: selectedAsset.asset.assetId,
                chainId: selectedAsset.chainId,
                address: selectedAsset.address,
              }),
            );
          }
        }}
      />
      <BackButton onClick={() => (done ? navigate($path('/dashboard')) : navigate($path('/exchange/select')))} />
      <div ref={setRoot} className="w-full h-[95svh]" id="mercuryo-widget">
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
};

export default Page;
