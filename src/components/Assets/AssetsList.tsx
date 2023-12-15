import { useGlobalContext } from '@/common/providers/contextProvider';

import AssetBalance from './AssetBalance';

const AssetsList = () => {
  const { assets } = useGlobalContext();

  return (
    <div className="flex flex-col gap-6 mt-4">
      {assets.map((asset) => (
        <AssetBalance asset={asset} balance={asset.totalBalance} name={asset.name} key={asset.chainId} />
      ))}
    </div>
  );
};

export default AssetsList;
