import { type ButtonProps, Button as NextUiButton } from '@nextui-org/react';

export const Button = (props: ButtonProps) => {
  return <NextUiButton {...props}>{props.children}</NextUiButton>;
};
