import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton.tsx';
import { AssetsList, TitleText } from '@/components';

const Page: FC = () => {
  const navigate = useNavigate();
  const { assets } = useGlobalContext();

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <TitleText className="mt-6 mb-10">Select a token to receive</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        <AssetsList
          className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
          showArrow
          assets={assets}
          onClick={asset => {
            navigate(
              $path('/receive/:chainId/:assetId/address', {
                chainId: asset.chainId,
                assetId: asset.asset.assetId.toString(),
              }),
            );
          }}
        />
      </div>
    </>
  );
};

export default Page;
