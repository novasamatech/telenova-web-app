import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { useBackButton } from '@/common/telegram/useBackButton.ts';
import { useMainButton } from '@/common/telegram/useMainButton.ts';
import { MNEMONIC_STORE } from '@/common/utils';
import { initializeWalletFromCloud } from '@/common/wallet';
import { Input, TitleText } from '@/components';

const Page: FC = () => {
  const { mainButton, addMainButton, reset, hideMainButton } = useMainButton();
  const { addBackButton } = useBackButton();
  const { webApp } = useTelegram();

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    mainButton.show();
    mainButton.disable();
    addBackButton(() => navigate($path('/settings/backup')));

    return hideMainButton;
  }, []);

  useEffect(() => {
    const callback = () => {
      if (password.length < 8) {
        setIsPasswordValid(false);

        return;
      }
      webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
        const decryptedMnemonic = initializeWalletFromCloud(password, value);
        setIsPasswordValid(Boolean(decryptedMnemonic));

        if (decryptedMnemonic) {
          navigate($path('/settings/password/new'));
        }
      });
    };

    if (password.length >= 1) {
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
        placeholder="Enter Password Here"
        type="password"
        className="max-w-sm text-left mt-8"
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
    </div>
  );
};

export default Page;
