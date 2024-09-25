import { useEffect, useMemo, useRef } from 'react';

import { TelegramApi } from '@/shared/api';

type Props = {
  text?: string;
  disabled?: boolean;
  progress?: boolean;
  hidden?: boolean;
  color?: string;
  textColor?: string;
  onClick: VoidFunction;
};

let hideButtonTimeout: ReturnType<typeof setTimeout> | null = null;

export const MainButton = ({ disabled, progress, hidden, color, textColor, text = 'Continue', onClick }: Props) => {
  const cbRef = useRef(onClick);
  cbRef.current = onClick;

  const MainButton = TelegramApi.Buttons.Main;

  const clickHandler = useMemo(() => () => cbRef.current(), []);

  useEffect(() => {
    TelegramApi.Buttons.Main.setText(text);
  }, [text]);

  useEffect(() => {
    MainButton.setParams({
      color: color ?? TelegramApi.themeParams.button_color,
      text_color: textColor ?? TelegramApi.themeParams.button_text_color,
    });
  }, [color, textColor]);

  useEffect(() => {
    if (hideButtonTimeout) {
      clearTimeout(hideButtonTimeout);
      hideButtonTimeout = null;
    }

    if (!hidden) {
      MainButton.show();
    }
    MainButton.onClick(clickHandler);

    return () => {
      hideButtonTimeout = setTimeout(() => MainButton.hide(), 0);

      MainButton.offClick(clickHandler);
      MainButton.hideProgress();
    };
  }, []);

  useEffect(() => {
    if (hidden) {
      MainButton.hide();
      MainButton.hideProgress();

      return;
    }
    MainButton.show();

    if (progress) {
      MainButton.showProgress();
      MainButton.disable();
    } else if (MainButton.isProgressVisible) {
      MainButton.hideProgress();
    }

    if (disabled) {
      MainButton.disable();
    } else {
      MainButton.show();
      MainButton.enable();
    }
  }, [disabled, progress, hidden]);

  return null;
};
