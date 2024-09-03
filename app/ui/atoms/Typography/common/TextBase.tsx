import { cnTw } from '@/shared/helpers/twMerge';

import { type TypographyProps } from './types';

export const TextBase = ({ as: Component = 'p', id, align = 'left', className, children }: TypographyProps) => {
  if (!children) return null;

  return (
    <Component
      id={id}
      className={cnTw(
        'font-manrope text-text-primary antialiased',
        {
          'text-left': align === 'left',
          'text-right': align === 'right',
          'text-center': align === 'center',
        },
        className,
      )}
    >
      {children}
    </Component>
  );
};
