import { AssetWithBalance } from '@/common/chainRegistry/types';
import { AssetBalance } from './Asset';

type Props = {
  assets: AssetWithBalance[];
};

const AssetsList = ({ assets }: Props) => (
  <div className="flex flex-col gap-6 mt-4">
    {assets.map((asset) => (
      <AssetBalance
        asset={asset}
        value={asset.balance}
        className="grid grid-cols-[50px,1fr,auto] items-center"
        key={asset.assetId}
      />
    ))}
  </div>
);

export default AssetsList;
