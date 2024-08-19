import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { AssetsList, BodyText, Icon, Input, TitleText } from '@/components';
import { balancesModel } from '@/models/balances';
import { assetsFilterModel, networkModel } from '@/models/network';
import { pricesModel } from '@/models/prices';

const Page = () => {
  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const balances = useUnit(balancesModel.$balances);
  const prices = useUnit(pricesModel.$prices);
  const [query, assets] = useUnit([assetsFilterModel.$query, assetsFilterModel.$assets]);

  useEffect(() => {
    assetsFilterModel.input.pageMounted();
  }, []);

  const navigateToAmount = (chainId: ChainId, assetId: AssetId) => {
    navigate(
      $path('/transfer/gift/:chainId/:assetId/amount', {
        chainId,
        assetId: assetId.toString(),
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
              className="w-full rounded-lg bg-white px-4 py-3 hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              showArrow
              chains={chains}
              assets={assets}
              balances={balances}
              prices={prices}
              onClick={navigateToAmount}
            />
          </div>
        )}

        {assets.length === 0 && (
          <div className="mt-[70px] flex flex-col items-center gap-y-4">
            <Icon name="NoResult" size={180} />
            <BodyText className="max-w-[225px] text-text-hint">Nothing to show here based on your search </BodyText>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
