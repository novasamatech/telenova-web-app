import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton.tsx';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { MNEMONIC_STORE } from '@/common/utils';
import { backupMnemonic, getStoreName } from '@/common/wallet';
import { PasswordForm, TitleText } from '@/components';

const Page: FC = () => {
  const { mainButton, addMainButton, reset } = useMainButton();
  const navigate = useNavigate();

  useEffect(() => {
    mainButton?.show();
    mainButton?.disable();

    return reset;
  }, []);

  const handleSubmit = (password: string) => {
    mainButton?.enable();
    const mainCallback = () => {
      navigate($path('/settings/password/confirmation'));
      const mnemonic = secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE));
      backupMnemonic(mnemonic as string, password);
    };

    addMainButton(mainCallback);
  };

  return (
    <>
      <BackButton onClick={() => navigate($path('/settings/password/change'))} />
      <div className="flex flex-col items-center pt-14">
        <TitleText>Enter your new password</TitleText>
        <PasswordForm onSubmit={handleSubmit} />
      </div>
    </>
  );
};

export default Page;
