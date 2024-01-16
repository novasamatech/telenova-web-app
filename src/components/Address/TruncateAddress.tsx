// @ts-expect-error no types
import MiddleEllipsis from 'react-middle-ellipsis';
import { TextBase } from '@/components';

type Props = {
  address?: string;
  className?: string;
};

const TruncateAddress = ({ address, className }: Props) => {
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
export default TruncateAddress;
