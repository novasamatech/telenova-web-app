import { useGlobalContext } from '@/common/providers/contextProvider';
import AssetBalance from './AssetBalance';

const AssetsList = () => {
  const { assets } = useGlobalContext();

  return (
    <div className="flex flex-col gap-6 mt-4">
      {assets.map((asset) => (
        <AssetBalance
          className="m-1"
          asset={asset.asset}
          balance={asset.totalBalance}
          name={asset.chainName}
          key={asset.chainId}
          showPrice
          animate
        />
      ))}
    </div>
  );
};

export default AssetsList;
