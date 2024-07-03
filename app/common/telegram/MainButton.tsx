import { useEffect, useMemo, useRef } from 'react';

import { useTelegram } from '@/common/providers';

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
  const { webApp } = useTelegram();

  const cbRef = useRef(onClick);
  cbRef.current = onClick;
  const clickHandler = useMemo(() => () => cbRef.current(), []);

  useEffect(() => {
    if (hideButtonTimeout) {
      clearTimeout(hideButtonTimeout);
      hideButtonTimeout = null;
    }

    if (!hidden) {
      webApp?.MainButton.show();
    }
    webApp?.MainButton.onClick(clickHandler);

    return () => {
      hideButtonTimeout = setTimeout(() => {
        webApp?.MainButton.hide();
      }, 50);

      webApp?.MainButton.offClick(clickHandler);
      webApp?.MainButton.enable();
      webApp?.MainButton.hideProgress();
    };
  }, []);

  useEffect(() => {
    if (hidden) {
      webApp?.MainButton.hide();
      webApp?.MainButton.enable();
      webApp?.MainButton.hideProgress();

      return;
    } else {
      webApp?.MainButton.show();
    }

    if (progress) {
      webApp?.MainButton.showProgress();
      webApp?.MainButton.disable();
    } else {
      if (webApp?.MainButton.isProgressVisible) {
        webApp?.MainButton.hideProgress();
      }
    }

    if (disabled) {
      webApp?.MainButton.disable();
    } else {
      webApp?.MainButton.show();
      webApp?.MainButton.enable();
    }
  }, [disabled, progress, hidden]);

  useEffect(() => {
    webApp?.MainButton.setParams({
      color: color ?? webApp?.themeParams.button_color,
      text_color: textColor ?? webApp?.themeParams.button_text_color,
    });
  }, [color, textColor]);

  useEffect(() => {
    webApp?.MainButton.setText(text);
  }, [text]);

  return null;
};