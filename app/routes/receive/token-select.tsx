import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { AssetsList, TitleText } from '@/components';
import { balancesModel, networkModel } from '@/models';
import { type AssetBalance } from '@/types/substrate';

const Page = () => {
  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const assets = useUnit(networkModel.$assets);
  const balances = useUnit(balancesModel.$balances);

  const navigateToAddress = (asset: AssetBalance) => {
    navigate(
      $path('/receive/:chainId/:assetId/address', {
        chainId: asset.chainId,
        assetId: asset.assetId.toString(),
      }),
    );
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <TitleText className="mt-6 mb-10">Select a token to receive</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        <AssetsList
          className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
          showArrow
          chains={chains}
          assets={assets}
          balances={balances}
          onClick={navigateToAddress}
        />
      </div>
    </>
  );
};

export default Page;
