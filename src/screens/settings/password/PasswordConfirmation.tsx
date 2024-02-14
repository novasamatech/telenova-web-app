import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@/common/providers/telegramProvider';
import { TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';
import { Icon } from '@/components';

export default function PasswordConfirmationPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { mainButton, addMainButton, hideMainButton } = useMainButton();

  useEffect(() => {
    const callback = () => {
      navigate(Paths.DASHBOARD, { replace: true });
    };
    BackButton?.hide();
    mainButton.enable();
    addMainButton(callback);

    return () => {
      hideMainButton();
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-[95vh]">
      <Icon name="Success" size={250} />
      <TitleText className="m-3">Password changed sussessfully!</TitleText>
    </div>
  );
}
