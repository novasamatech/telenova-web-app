import { Switch as NextUiSwitch, type SwitchProps } from '@nextui-org/react';

export const Switch = (props: Omit<SwitchProps, 'classNames'>) => {
  return (
    <NextUiSwitch
      {...props}
      classNames={{
        wrapper: 'group-data-[selected=true]:bg-[--tg-theme-button-color]',
      }}
    />
  );
};
// text-[--tg-theme-button-color]
