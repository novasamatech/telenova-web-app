import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { AssetIcon, BodyText, Icon, Input, MediumTitle, Plate, Switch, TitleText } from '@/components';
import { type Asset } from '@/types/substrate';

import { assetsPageModel } from './_model/assets-page-model';

const Page = () => {
  const navigate = useNavigate();

  const query = useUnit(assetsPageModel.$query);
  const assets = useUnit(assetsPageModel.$assets);

  const toggleAsset = (chainId: ChainId, assetId: AssetId) => (checked: boolean) => {
    assetsPageModel.inputs.assetToggled({ chainId, assetId, checked });
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/dashboard'))} />
      <div className="flex flex-col gap-y-4">
        <TitleText>Manage tokens</TitleText>
        <Input
          isClearable
          variant="flat"
          placeholder="Search"
          className="h-12"
          startContent={<Icon name="Search" size={16} className="text-text-hint" />}
          value={query}
          onValueChange={assetsPageModel.inputs.queryChanged}
          onClear={() => assetsPageModel.inputs.queryChanged('')}
        />
        <ul className="flex flex-col gap-y-2">
          {assets.map(tuple => {
            const [chainId, asset] = tuple as [ChainId, Asset];

            return (
              <li key={asset.symbol}>
                <Plate className="flex gap-x-3 py-2 px-2.5 items-center">
                  <AssetIcon src={asset.icon} size={48} />
                  <MediumTitle as="span" className="uppercase">
                    {asset.symbol}
                  </MediumTitle>
                  <Switch className="ml-auto" checked={true} onValueChange={toggleAsset(chainId, asset.assetId)} />
                </Plate>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-y-4 items-center mt-[70px]">
          <Icon name="NoResult" size={180} />
          <BodyText>Nothing to show here based on your search </BodyText>
        </div>
      </div>
    </>
  );
};

export default Page;
