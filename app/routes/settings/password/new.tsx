import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { $path } from 'remix-routes';

import { walletModel } from '@/models/wallet';
import { BackButton, MainButton } from '@/shared/api';
import { TitleText } from '@/ui/atoms';
import { CreatePasswordForm } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const onSubmit = () => {
    walletModel.input.mnemonicChanged({ password });
    navigate($path('/settings/password/confirmation'));
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
