import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { MNEMONIC_STORE } from '@/common/utils/constants';
import { backupMnemonic, getStoreName } from '@/common/wallet';
import { PasswordForm, TitleText } from '@/components';

export default function NewPasswordPage() {
  const { BackButton } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const navigate = useNavigate();

  useEffect(() => {
    const callback = () => navigate($path('/settings/change-password'));
    BackButton?.show();
    BackButton?.onClick(callback);
    mainButton?.show();
    mainButton?.disable();

    return () => {
      BackButton?.offClick(callback);
      reset();
    };
  }, []);

  const handleSubmit = (password: string) => {
    mainButton?.enable();
    const mainCallback = () => {
      navigate($path('/settings/password-confirmation'));
      const mnemonic = secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE));
      backupMnemonic(mnemonic as string, password);
    };

    addMainButton(mainCallback);
  };

  return (
    <div className="flex flex-col items-center pt-14">
      <TitleText>Enter your new password</TitleText>
      <PasswordForm onSubmit={handleSubmit} />
    </div>
  );
}
