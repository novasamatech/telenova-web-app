import { useCallback, useEffect, useRef } from 'react';

import { type BackButton } from '@twa-dev/types';

let hideButtonTimeout: ReturnType<typeof setTimeout> | null = null;

export const useBackButton = () => {
  const backButtonEvent = useRef<VoidFunction | null>(null);

  const ref = useRef<BackButton | null>(window?.Telegram?.WebApp?.BackButton ?? null);
  const backButton = ref.current;

  useEffect(() => {
    ref.current = window?.Telegram?.WebApp?.BackButton;
  }, [window?.Telegram]);

  const addBackButton = useCallback(
    (fn: VoidFunction) => {
      if (hideButtonTimeout) {
        clearTimeout(hideButtonTimeout);
        hideButtonTimeout = null;
      }

      if (backButton) {
        if (backButtonEvent.current) {
          backButton.offClick(backButtonEvent.current);
        }

        backButton.show();
        backButton.onClick(fn);
        backButtonEvent.current = fn;
      }
    },
    [backButton, backButtonEvent],
  );

  const hideBackButton = useCallback(() => {
    if (backButton) {
      if (backButtonEvent.current) {
        backButton.offClick(backButtonEvent.current);
        backButtonEvent.current = null;
      }

      hideButtonTimeout = setTimeout(() => {
        hideButtonTimeout = null;
        backButton.hide();
      }, 100);
    }
  }, [backButton]);

  useEffect(() => hideBackButton, [hideBackButton]);

  return { addBackButton, hideBackButton, backButton };
};
