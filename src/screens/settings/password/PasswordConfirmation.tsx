import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@/common/providers/telegramProvider';
import { TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';

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
      <div className="bg-white rounded-full p-3 w-[114px] h-[114px]" />
      <TitleText className="m-3">Password changed sussessfully!</TitleText>
    </div>
  );
}
