'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { Paths } from '@/common/routing';
import { TitleText } from '@/components';
import { initializeWalletFromCloud } from '@/common/wallet';
import { MNEMONIC_STORE } from '@/common/utils/constants';

export default function ChangePasswordPage() {
  const { BackButton, webApp } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    BackButton?.show();
    const callback = () => navigate(Paths.SETTINGS_BACKUP);
    BackButton?.onClick(callback);
    mainButton.show();
    mainButton.disable();

    return () => {
      BackButton?.offClick(callback);
      reset();
    };
  }, []);

  useEffect(() => {
    const callback = () => {
      mainButton.showProgress();

      webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
        const decryptedMnemonic = initializeWalletFromCloud(password, value);
        setIsPasswordValid(Boolean(decryptedMnemonic));
        mainButton.hideProgress();

        if (decryptedMnemonic) {
          navigate(Paths.SETTINGS_NEW_PASSWORD);
        }
      });
    };

    if (password.length >= 8) {
      mainButton.enable();
      addMainButton(callback);
    } else {
      mainButton.disable();
    }

    return () => {
      reset();
    };
  }, [password]);

  return (
    <div className="flex flex-col items-center pt-14">
      <TitleText>Enter your current password</TitleText>
      <Input
        isClearable
        variant="flat"
        placeholder="Enter 8-character password here"
        type="password"
        className="max-w-sm text-left mt-8"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1',
            'group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
        }}
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
    </div>
  );
}
