import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { json } from '@remix-run/node';
import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $params, $path } from 'remix-routes';

import { isWebPlatform } from '@/common/telegram';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { MediumTitle } from '@/components';
import { networkModel, telegramModel, walletModel } from '@/models';
import { runMercuryoWidget, toAddress } from '@/shared/helpers';

export type SearchParams = {
  type: 'buy' | 'sell';
};

export const loader = () => {
  return json({
    mercuryoSecret: process.env.PUBLIC_WIDGET_SECRET,
    mercuryoWidgetId: process.env.PUBLIC_WIDGET_ID,
  });
};

export const clientLoader = (async ({ params, request, serverLoader }) => {
  const serverData = await serverLoader<typeof loader>();

  const url = new URL(request.url);

  const data = {
    ...$params('/exchange/widget/:chainId/:assetId', params),
    type: (url.searchParams.get('type') || 'buy') as SearchParams['type'],
  };

  return { ...serverData, ...data };
}) satisfies ClientLoaderFunction;

const Page = () => {
  const { chainId, assetId, mercuryoSecret, mercuryoWidgetId, type } = useLoaderData<typeof clientLoader>();

  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);
  const wallet = useUnit(walletModel.$wallet);
  const webApp = useUnit(telegramModel.$webApp);

  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [done, setDone] = useState(false);
  const [isSendBtnVisible, setIsSendBtnVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  const typedChainId = chainId as ChainId;
  const selectedAsset = assets[typedChainId]?.[Number(assetId) as AssetId];

  useEffect(() => {
    if (!wallet?.publicKey || !selectedAsset || isWebPlatform(webApp!.platform) || !root || !type) return;

    runMercuryoWidget({
      root,
      returnPage: $path('/dashboard'),
      secret: mercuryoSecret,
      widgetId: mercuryoWidgetId,
      address: toAddress(wallet.publicKey, { prefix: chains[typedChainId].addressPrefix }),
      operationType: type,
      symbol: selectedAsset.symbol,
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
    if (done) {
      navigate($path('/dashboard'));
    } else {
      navigate(-1);
    }
  };

  if (!selectedAsset) return null;

  return (
    <>
      <MainButton
        text={`Send ${selectedAsset.symbol} to sell`}
        hidden={!isSendBtnVisible}
        onClick={navigateToTransfer}
      />
      <BackButton onClick={navigateBack} />
      <div ref={setRoot} className="h-[95svh] w-full" id="mercuryo-widget">
        {isWebPlatform(webApp?.platform) && (
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
