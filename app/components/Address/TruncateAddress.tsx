// @ts-expect-error no types
import MiddleEllipsis from 'react-middle-ellipsis';

import { TextBase } from '../Typography';

type Props = {
  address?: string;
  className?: string;
};

export const TruncateAddress = ({ address, className }: Props) => {
  return (
    <span className={className}>
      <MiddleEllipsis>
        <TextBase as="span" className="text-body-bold">
          {address}
        </TextBase>
      </MiddleEllipsis>
    </span>
  );
};
