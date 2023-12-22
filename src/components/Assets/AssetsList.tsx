import { useGlobalContext } from '@/common/providers/contextProvider';

import AssetBalance from './AssetBalance';
import { Button } from '@nextui-org/react';

const AssetsList = () => {
  const { assets } = useGlobalContext();

  // TODO: delete it later
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {assets.map((asset) => (
        <Button key={asset.chainId} variant="light" className="w-full block" onClick={() => copyAddress(asset.address)}>
          <AssetBalance asset={asset} balance={asset.totalBalance} name={asset.name} key={asset.chainId} />
        </Button>
      ))}
    </div>
  );
};

export default AssetsList;
