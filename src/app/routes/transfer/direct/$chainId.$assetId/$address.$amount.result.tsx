import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { type ClientLoaderFunction, useLoaderData } from '@remix-run/react';

import { $params, $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { pickAsset } from '@/common/utils';
import { Icon, MediumTitle, TitleText } from '@/components';

export const clientLoader = (({ params }) => {
  return $params('/transfer/direct/:chainId/:assetId/:address/:amount/result', params);
}) satisfies ClientLoaderFunction;

const Page: FC = () => {
  const { address, amount, assetId, chainId } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const { hideMainButton, addMainButton, mainButton } = useMainButton();
  const { assets } = useGlobalContext();

  const selectedAsset = pickAsset({ chainId, assetId, assets });

  useEffect(() => {
    mainButton.show();
    const callback = () => {
      navigate($path('/dashboard'), { replace: true });
    };
    addMainButton(callback, 'Done');

    return hideMainButton;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[95vh] gap-3">
      <Icon name="Success" size={250} />
      <TitleText>
        {amount} {selectedAsset?.asset?.symbol} Sent to
      </TitleText>
      <MediumTitle className="text-text-hint break-all" align="center">
        {address}
      </MediumTitle>
      <MediumTitle className="text-text-hint" align="center">
        Your transaction has been sent to the network and will be processed in a few seconds.
      </MediumTitle>
    </div>
  );
};

export default Page;
