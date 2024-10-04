import { useCallback, useEffect, useRef } from 'react';

import { type BackButton as BackButtonType } from '@twa-dev/types';

import { TelegramApi } from '@/shared/api';

type Props = {
  hidden?: boolean;
  onClick?(): unknown;
};

const defaultCallback = () => window.history.back();
let hideButtonTimeout: ReturnType<typeof setTimeout> | null = null;

export const BackButton = ({ hidden, onClick = defaultCallback }: Props) => {
  const backButtonEvent = useRef<VoidFunction | null>(null);
  const ref = useRef<BackButtonType | null>(TelegramApi.Buttons.Back || null);
  const backButton = ref.current;

  useEffect(() => {
    ref.current = TelegramApi.Buttons.Back || null;
  }, [window.Telegram]);

  const addBackButton = useCallback(
    (fn: VoidFunction) => {
      if (hideButtonTimeout) {
        clearTimeout(hideButtonTimeout);
        hideButtonTimeout = null;
      }

      if (!backButton) return;

      if (backButtonEvent.current) {
        backButton.offClick(backButtonEvent.current);
      }

      backButton.show();
      backButton.onClick(fn);
      backButtonEvent.current = fn;
    },
    [backButton, backButtonEvent],
  );

  const hideBackButton = useCallback(() => {
    if (!backButton) return;

    if (backButtonEvent.current) {
      backButton.offClick(backButtonEvent.current);
      backButtonEvent.current = null;
    }

    hideButtonTimeout = setTimeout(() => {
      hideButtonTimeout = null;
      backButton.hide();
    }, 50);
  }, [backButton]);

  useEffect(hideBackButton, [hideBackButton]);

  useEffect(() => {
    if (hidden) {
      backButton?.hide();
    } else {
      addBackButton(onClick);
    }
  }, [hidden, onClick]);

  return null;
};
