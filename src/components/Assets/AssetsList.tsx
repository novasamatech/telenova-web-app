import { useGlobalContext } from '@/common/providers/contextProvider';
import AssetBalance from './AssetBalance';

const AssetsList = () => {
  const { assets } = useGlobalContext();

  return (
    <div className="flex flex-col gap-4 mt-4">
      {assets.map((asset) => (
        <AssetBalance
          className="m-1"
          asset={asset.asset}
          balance={asset.totalBalance}
          name={asset.name}
          key={asset.chainId}
          showPrice
        />
      ))}
    </div>
  );
};

export default AssetsList;
