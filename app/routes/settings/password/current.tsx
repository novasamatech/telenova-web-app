import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { useTelegram } from '@/common/providers';
import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { MNEMONIC_STORE } from '@/common/utils';
import { initializeWalletFromCloud } from '@/common/wallet';
import { Input, TitleText } from '@/components';

const Page = () => {
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState('');
  const [hadChecked, setHadChecked] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);

  const isPasswordValid = password.length > 0;

  const submit = () => {
    console.log('submit');
    if (!isPasswordValid) {
      return;
    }

    setIsValidMnemonic(true);
    setPending(true);

    webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
      const decryptedMnemonic = initializeWalletFromCloud(password, value);
      if (decryptedMnemonic) {
        navigate($path('/settings/password/new'));
      } else {
        setIsValidMnemonic(false);
        setPending(false);
        setHadChecked(true);
      }
    });
  };

  const shouldShowError = hadChecked && !isValidMnemonic;

  return (
    <>
      <MainButton progress={pending} disabled={!isPasswordValid} onClick={submit} />
      <BackButton onClick={() => navigate($path('/settings/backup'))} />
      <div className="flex flex-col items-center pt-14">
        <TitleText>Enter your current password</TitleText>
        <Input
          isClearable
          variant="flat"
          placeholder="Enter Password Here"
          type="password"
          className="max-w-sm text-left mt-8"
          value={password}
          isInvalid={shouldShowError}
          errorMessage={shouldShowError && 'It seems your password is incorrect.'}
          onValueChange={setPassword}
          onClear={() => setPassword('')}
        />
      </div>
    </>
  );
};

export default Page;
