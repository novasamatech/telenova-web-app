import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useTelegram } from '@/common/providers/telegramProvider';
import { TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';

export default function PasswordConfirmationPage() {
  const router = useRouter();
  const { BackButton } = useTelegram();
  const { mainButton, addMainButton, hideMainButton } = useMainButton();

  useEffect(() => {
    const callback = () => {
      router.push(Paths.DASHBOARD);
    };
    BackButton?.hide();
    mainButton.enable();
    addMainButton(callback);

    return () => {
      hideMainButton();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5">
      <div className="bg-white rounded-full p-3 w-[114px] h-[114px]" />
      <TitleText className="m-3">Password changed sussessfully!</TitleText>
    </div>
  );
}
