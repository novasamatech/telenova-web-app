import { Button } from '@nextui-org/react';

import { useGlobalContext } from '@/common/providers/contextProvider';
import AssetBalance from './AssetBalance';

const AssetsList = () => {
  const { assets } = useGlobalContext();

  // TODO: delete it later
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {assets.map((asset) => (
        <Button
          key={asset.chainId}
          variant="light"
          className="w-full block h-full p-[2px]"
          onClick={() => copyAddress(asset.address)}
        >
          <AssetBalance
            asset={asset.asset}
            balance={asset.totalBalance}
            name={asset.name}
            key={asset.chainId}
            showPrice
          />
        </Button>
      ))}
    </div>
  );
};

export default AssetsList;
