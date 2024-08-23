import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { initializeWalletFromCloud } from '@/common/wallet';
import { telegramModel } from '@/models/telegram';
import { MNEMONIC_STORE } from '@/shared/helpers';
import { Input, TitleText } from '@/ui/atoms';

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);

  const isPasswordValid = password.length > 0;

  const onSubmit = () => {
    if (!webApp || !isPasswordValid) return;

    setIsValidMnemonic(true);
    setIsPending(true);

    webApp.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
      const decryptedMnemonic = initializeWalletFromCloud(password, value);
      if (decryptedMnemonic) {
        navigate($path('/settings/password/new'));
      } else {
        setIsValidMnemonic(false);
        setIsPending(false);
        setIsChecked(true);
      }
    });
  };

  const shouldShowError = isChecked && !isValidMnemonic;

  return (
    <>
      <MainButton progress={isPending} disabled={!isPasswordValid} onClick={onSubmit} />
      <BackButton onClick={() => navigate($path('/settings/backup'))} />
      <div className="flex flex-col items-center pt-14">
        <TitleText>Enter your current password</TitleText>
        <Input
          isClearable
          variant="flat"
          placeholder="Enter Password Here"
          type="password"
          className="mt-8 max-w-sm text-left"
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
