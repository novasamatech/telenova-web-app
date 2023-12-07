import Image from 'next/image';
import { FootnoteText } from '../Typography';
import AllIcons, { IconNames } from './types';

type Props = {
  name: IconNames;
  size?: number;
  className?: string;
  alt?: string;
  text?: string;
  priority?: boolean;
};

const Icon = ({ name, size = 24, className, text, priority, alt = '' }: Props) => {
  let iconPath = AllIcons[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" doesn't exist`);

    return <div style={{ width: size, height: size, borderRadius: 10, backgroundColor: 'lightgrey' }} />;
  }

  return text ? (
    <div className="text-center">
      <Image
        className={className}
        src={`/images/${iconPath}`}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        data-testid={`${name}-img`}
      />
      <FootnoteText as="span">{text}</FootnoteText>
    </div>
  ) : (
    <Image
      className={className}
      src={`/images/${iconPath}`}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      data-testid={`${name}-img`}
    />
  );
};

export default Icon;
