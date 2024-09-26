import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { networkModel } from '@/models/network';
import { BackButton } from '@/shared/api';
import { getParentChain } from '@/shared/helpers';
import { AssetIcon, BodyText, Icon, Input, MediumTitle, Plate, Switch, TitleText } from '@/ui/atoms';

import { assetsPageModel } from './_model/assets-page-model';

const Page = () => {
  const navigate = useNavigate();

  const chains = useUnit(networkModel.$chains);
  const [query, assets] = useUnit([assetsPageModel.$query, assetsPageModel.$assets]);

  useEffect(() => {
    assetsPageModel.input.pageMounted();
  }, []);

  const toggleAsset = (chainId: ChainId, assetId: AssetId) => (selected: boolean) => {
    assetsPageModel.input.assetToggled({ chainId, assetId, selected });
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <div className="flex flex-col gap-y-4">
        <TitleText align="left">Manage tokens</TitleText>
        <Input
          isClearable
          variant="flat"
          placeholder="Search"
          className="h-12"
          startContent={<Icon name="Search" size={16} className="text-text-hint" />}
          value={query}
          onValueChange={assetsPageModel.input.queryChanged}
          onClear={() => assetsPageModel.input.queryChanged('')}
        />

        {assets.length > 0 && (
          <ul className="flex flex-col gap-y-2">
            {assets.map(([chainId, asset, isActive]) => (
              <Plate
                component="li"
                key={`${chainId}_${asset.assetId}`}
                className="flex items-center gap-x-3 px-2.5 py-2"
              >
                <AssetIcon src={asset.icon} size={48} />
                <div className="flex flex-col">
                  <MediumTitle as="span" className="uppercase">
                    {asset.symbol}
                  </MediumTitle>
                  <BodyText as="span" className="text-text-hint">
                    {getParentChain(chains, chainId, asset)?.name}
                  </BodyText>
                </div>
                <Switch className="ml-auto" isSelected={isActive} onValueChange={toggleAsset(chainId, asset.assetId)} />
              </Plate>
            ))}
          </ul>
        )}

        {assets.length === 0 && (
          <div className="mt-[70px] flex flex-col items-center gap-y-4">
            <Icon name="NoResult" size={180} />
            <BodyText className="max-w-[225px] text-text-hint">Nothing to show here based on your search</BodyText>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
