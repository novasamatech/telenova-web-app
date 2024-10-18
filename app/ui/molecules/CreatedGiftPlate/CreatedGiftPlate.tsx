import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { networkModel } from '@/models/network';
import { cnTw, getGifts } from '@/shared/helpers';
import { useGifts } from '@/shared/hooks';
import { type Gift } from '@/types/substrate';
import { BodyText, Icon, MediumTitle, Plate, Shimmering } from '@/ui/atoms';

type Props = {
  className?: string;
};

export const CreatedGiftPlate = ({ className }: Props) => {
  const { getGiftsState } = useGifts();

  const connections = useUnit(networkModel.$connections);

  const [unclaimed, setUnclaimed] = useState<Gift[] | null>(null);

  useEffect(() => {
    const localStorageGifts = getGifts();
    if (localStorageGifts) {
      getGiftsState(localStorageGifts).then(([unclaimed]) => setUnclaimed(unclaimed));
    } else {
      setUnclaimed([]);
    }
  }, [connections]);

  return (
    <Plate
      className={cnTw(
        'w-full rounded-3xl border-1 border-border-neutral px-4 py-2.5 active:bg-bg-item-pressed',
        className,
      )}
    >
      <Link to={$path('/gifts')} className="grid h-10 w-full grid-cols-[auto,1fr,auto] items-center gap-x-2">
        <Icon name="Gift" size={25} className="text-text-link" />
        <div className="flex items-center gap-x-1">
          <MediumTitle className="font-medium">Created Gifts</MediumTitle>
          {!unclaimed && <Shimmering width={20} height={20} />}
          {unclaimed && unclaimed?.length > 0 && <BodyText className="text-text-hint">{unclaimed.length}</BodyText>}
        </div>
        <Icon name="ChevronForward" size={24} className="self-center" />
      </Link>
    </Plate>
  );
};
