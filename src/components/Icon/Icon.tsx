import AllIcons, { IconNames } from './types';
type Props = {
  name: IconNames;
  size?: number;
  className?: string;
  alt?: string;
};

const Icon = ({ name, size = 24, className }: Props) => {
  const IconComponent = AllIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" doesn't exist`);

    return <div style={{ width: size, height: size, borderRadius: 10, backgroundColor: 'lightgrey' }} />;
  }

  return <IconComponent className={className} width={size} height={size} />;
};

export default Icon;
