import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { AssetsList, BodyText, Icon, Input, TitleText } from '@/components';
import { assetsFilterModel, balancesModel, networkModel } from '@/models';
import { type AssetBalance } from '@/types/substrate';

const Page = () => {
  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const balances = useUnit(balancesModel.$balances);
  const query = useUnit(assetsFilterModel.$query);
  const assets = useUnit(assetsFilterModel.$assets);

  useEffect(() => {
    assetsFilterModel.input.pageMounted();
  }, []);

  const navigateToAddress = (asset: AssetBalance) => {
    navigate(
      $path('/transfer/direct/:chainId/:assetId/address', {
        chainId: asset.chainId,
        assetId: asset.assetId.toString(),
      }),
    );
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/transfer'))} />
      <div className="flex flex-col gap-y-4">
        <TitleText align="left">Select a token to send</TitleText>
        <Input
          isClearable
          variant="flat"
          placeholder="Search"
          className="h-12"
          startContent={<Icon name="Search" size={16} className="text-text-hint" />}
          value={query}
          onValueChange={assetsFilterModel.input.queryChanged}
          onClear={() => assetsFilterModel.input.queryChanged('')}
        />

        {assets.length > 0 && (
          <div className="flex flex-col gap-y-2">
            <AssetsList
              className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              showArrow
              chains={chains}
              assets={assets}
              balances={balances}
              onClick={navigateToAddress}
            />
          </div>
        )}

        {assets.length === 0 && (
          <div className="flex flex-col gap-y-4 items-center mt-[70px]">
            <Icon name="NoResult" size={180} />
            <BodyText className="max-w-[225px] text-text-hint">Nothing to show here based on your search </BodyText>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
