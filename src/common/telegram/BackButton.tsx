import { type FC, useEffect } from 'react';

import { useBackButton } from '@/common/telegram/useBackButton.ts';

type Props = {
  onClick?(): unknown;
};

const defaultCallback = () => window.history.back();

export const BackButton: FC<Props> = ({ onClick = defaultCallback }) => {
  const { addBackButton } = useBackButton();
  useEffect(() => {
    addBackButton(onClick);
  }, [onClick]);

  return null;
};
