import AllIcons, { IconNames } from './types';
import Image from 'next/image';

type Props = {
  name: IconNames;
  size?: number;
  className?: string;
  alt?: string;
};

const Icon = ({ name, size = 24, className, alt = '' }: Props) => {
  let iconPath = AllIcons[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" doesn't exist`);

    return <div style={{ width: size, height: size, borderRadius: 10, backgroundColor: 'lightgrey' }} />;
  }

  return (
    <Image
      className={className}
      src={`/images/${iconPath}`}
      alt={alt}
      width={size}
      height={size}
      data-testid={`${name}-img`}
    />
  );
};

export default Icon;
