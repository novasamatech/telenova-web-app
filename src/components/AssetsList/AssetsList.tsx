import { useGlobalContext } from '@/common/providers/contextProvider';
import { AssetBalance } from './Asset';

const AssetsList = () => {
  const { assets } = useGlobalContext();
  const sortedAssets = assets.sort((a, b) => a.symbol.localeCompare(b.symbol));

  return (
    <div className="flex flex-col gap-6 mt-4">
      {sortedAssets.map((asset) => (
        <AssetBalance
          asset={asset}
          balance={asset.totalBalance}
          className="grid grid-cols-[50px,1fr,auto] items-center"
          name={asset.name}
          key={asset.chainId}
        />
      ))}
    </div>
  );
};

export default AssetsList;
