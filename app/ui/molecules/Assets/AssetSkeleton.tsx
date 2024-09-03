import { Shimmering } from '@/ui/atoms';

export const AssetSkeleton = () => {
  return (
    <div className="grid grid-cols-[48px,1fr,auto] grid-rows-[1fr,auto] items-center gap-x-3 gap-y-1">
      <Shimmering circle width={44} height={44} className="row-span-2" />
      <Shimmering width={100} height={24} />
      <Shimmering width={50} height={24} />
      <div className="col-span-2 flex items-center justify-between">
        <Shimmering width={60} height={20} />
        <Shimmering width={40} height={20} />
      </div>
    </div>
  );
};
