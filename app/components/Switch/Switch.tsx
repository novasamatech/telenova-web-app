import { Switch as NextUiSwitch, type SwitchProps } from '@nextui-org/react';

export const Switch = (props: Omit<SwitchProps, 'classNames'>) => {
  return (
    <NextUiSwitch
      {...props}
      classNames={{
        thumb: 'w-5 h-5',
        wrapper: 'w-11 h-6 px-0.5 mr-0 group-data-[selected=true]:bg-[--tg-theme-button-color]',
      }}
    />
  );
};
