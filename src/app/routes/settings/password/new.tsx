import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton.tsx';
import { MainButton } from '@/common/telegram/MainButton.tsx';
import { MNEMONIC_STORE } from '@/common/utils';
import { backupMnemonic, getStoreName } from '@/common/wallet';
import { CreatePasswordForm, TitleText } from '@/components';

const Page: FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const handleSubmit = () => {
    const mnemonic = secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE));
    if (typeof mnemonic === 'string') {
      backupMnemonic(mnemonic, password);
      navigate($path('/settings/password/confirmation'));
    }
  };

  return (
    <>
      <MainButton disabled={!valid} onClick={handleSubmit} />
      <BackButton onClick={() => navigate($path('/settings/password/current'))} />
      <div className="flex flex-col items-center pt-14">
        <TitleText>Enter your new password</TitleText>
        <CreatePasswordForm password={password} onChange={setPassword} onStatusChange={setValid} />
      </div>
    </>
  );
};

export default Page;
