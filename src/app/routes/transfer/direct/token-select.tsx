import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useGlobalContext } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { AssetsList, TitleText } from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const { assets } = useGlobalContext();

  return (
    <>
      <BackButton onClick={() => navigate($path('/transfer'))} />
      <TitleText className="mt-6 mb-10">Select a token to send</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        <AssetsList
          assets={assets}
          showArrow
          className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
          onClick={asset => {
            navigate(
              $path('/transfer/direct/:chainId/:assetId/address', {
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
