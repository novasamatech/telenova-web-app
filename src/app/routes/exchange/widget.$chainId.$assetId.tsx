import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { type LoaderFunction, json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { $params, $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { isOpenInWeb } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { pickAsset, runMercuryoWidget } from '@/common/utils';
import { MediumTitle } from '@/components';

export const loader = (() => {
  return json({
    mercuryoSecret: process.env.PUBLIC_WIDGET_SECRET,
    mercuryoWidgetId: process.env.PUBLIC_WIDGET_ID,
  });
}) satisfies LoaderFunction;

export const clientLoader = (async ({ params, serverLoader }) => {
  const serverData = await serverLoader<typeof loader>();
  const data = $params('/exchange/widget/:chainId/:assetId', params);

  return { ...serverData, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId, mercuryoSecret, mercuryoWidgetId } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const { assets } = useGlobalContext();

  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [done, setDone] = useState(false);
  const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  const selectedAsset = pickAsset(chainId, assetId, assets);

  useEffect(() => {
    if (!selectedAsset || isOpenInWeb(webApp!.platform) || !root) return;

    runMercuryoWidget({
      root,
      returnPage: $path('/dashboard'),
      secret: mercuryoSecret,
      widgetId: mercuryoWidgetId,
      selectedAsset,
      handleStatus,
      handleSell,
    });
  }, [root]);

  const handleStatus = (data: { status: 'paid' | 'new' }) => {
    if (data.status === 'paid' || data.status === 'new') {
      setDone(true);
    }
  };

  const handleSell = (data: { address: string; amount: string }) => {
    setIsSendBtnVisible(true);
    setAmount(data.amount);
    setDestination(data.address);
  };

  const navigateToTransfer = () => {
    const params = { chainId, assetId, address: destination };
    const query = { amount };

    navigate($path('/transfer/direct/:chainId/:assetId/:address/amount', params, query));
  };

  const navigateBack = () => {
    const url = done ? '/dashboard' : '/exchange/select';
    navigate($path(url));
  };

  return (
    <>
      <MainButton
        text={`Send ${selectedAsset?.asset?.symbol} to sell`}
        hidden={!isSendBtnVisible}
        onClick={navigateToTransfer}
      />
      <BackButton onClick={navigateBack} />
      <div ref={setRoot} className="w-full h-[95svh]" id="mercuryo-widget">
        {isOpenInWeb(webApp?.platform) && (
          <div>
            <MediumTitle align="center">
              Sorry, the $chainId.$assetId is not supported in the web version. Proceed with the application.
            </MediumTitle>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
