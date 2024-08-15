import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { type LinkProps, Link as NextUiLink } from '@nextui-org/link';

import { MediumTitle } from '../Typography';

import { cnTw } from '@/shared/helpers';

type Props = Omit<LinkProps, 'anchorIcon' | 'showAnchorIcon'> & {
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
};

export const LinkButton = ({ href, prefixIcon, suffixIcon, className, children, ...props }: Props) => {
  return (
    <NextUiLink as={Link} to={href} {...props} className={cnTw('text-text-link', className)}>
      <div className="flex items-center gap-x-2">
        {prefixIcon}
        <MediumTitle className="text-inherit">{children}</MediumTitle>
        {suffixIcon}
      </div>
    </NextUiLink>
  );
};
