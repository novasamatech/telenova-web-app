import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { BackButton } from '@/common/telegram/BackButton';
import { MainButton } from '@/common/telegram/MainButton';
import { telegramModel } from '@/models/telegram';
import { cryptoApi } from '@/shared/api';
import { TitleText } from '@/ui/atoms';
import { CreatePasswordForm } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const webApp = useUnit(telegramModel.$webApp);

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const onSubmit = () => {
    if (!webApp) return;
    const mnemonic = cryptoApi.getMnemonic(webApp);

    if (mnemonic) {
      cryptoApi.backupMnemonic(webApp, mnemonic, password);
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
