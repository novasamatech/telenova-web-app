import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { backupMnemonic } from '@/common/wallet';
import { CreatePasswordForm, TitleText } from '@/components';
import { telegramModel } from '@/models/telegram';
import { telegramApi } from '@/shared/api';
import { MNEMONIC_STORE } from '@/shared/helpers';

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const onSubmit = () => {
    if (!webApp) return;
    const mnemonic = secureLocalStorage.getItem(telegramApi.getStoreName(webApp, MNEMONIC_STORE));

    if (typeof mnemonic === 'string') {
      backupMnemonic(webApp, mnemonic, password);
      navigate($path('/settings/password/confirmation'));
    }
  };

  return (
    <>
      <MainButton disabled={!valid} onClick={onSubmit} />
      <BackButton onClick={() => navigate($path('/settings/password/current'))} />
      <div className="flex flex-col items-center pt-14">
        <TitleText>Enter your new password</TitleText>
        <CreatePasswordForm password={password} onChange={setPassword} onStatusChange={setValid} />
      </div>
    </>
  );
};

export default Page;
