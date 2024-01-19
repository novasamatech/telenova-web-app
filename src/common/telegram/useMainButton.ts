import { useCallback, useEffect, useRef } from 'react';
import { MainButton } from '@twa-dev/types';

export const useMainButton = () => {
  const mainButtonEvent = useRef(null);

  const ref = useRef<MainButton>(window?.Telegram?.WebApp?.MainButton);

  useEffect(() => {
    ref.current = window?.Telegram?.WebApp?.MainButton;
  }, [window?.Telegram]);

  const mainButton = ref.current;

  const reset = () => {
    if (mainButtonEvent.current) {
      mainButton.offClick(mainButtonEvent.current);
      mainButtonEvent.current = null;
    }
  };

  const addMainButton = useCallback(
    (event: VoidFunction, text: string = 'Continue') => {
      reset();

      mainButton.setText(text);
      mainButton.show();
      mainButton.onClick(event);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mainButtonEvent.current = event;
    },
    [mainButtonEvent],
  );

  const hideMainButton = useCallback(() => {
    mainButton.hide();
    reset();
  }, []);

  return { addMainButton, hideMainButton, mainButton, ...ref.current };
};
