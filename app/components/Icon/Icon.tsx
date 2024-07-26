import { type ComponentType, type SVGAttributes } from 'react';

import { AllIcons, type IconNames } from './types';

type Props = {
  name: IconNames;
  size?: number;
  className?: string;
  alt?: string;
};

export const Icon = ({ name, size = 24, className }: Props) => {
  const IconComponent = AllIcons[name] as unknown as ComponentType<SVGAttributes<unknown>>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" doesn't exist`);

    return <div style={{ width: size, height: size, borderRadius: 10, backgroundColor: 'lightgrey' }} />;
  }

  return <IconComponent className={className} width={size} height={size} />;
};
