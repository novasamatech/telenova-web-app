import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button } from '@nextui-org/react';
import { useLocation } from '@remix-run/react';
import { $path } from 'remix-routes';

import { walletModel } from '@/models/wallet';
import { MainButton, TelegramApi, cryptoApi } from '@/shared/api';
import { BACKUP_DATE } from '@/shared/helpers';
import { useToggle } from '@/shared/hooks';
import { BodyText, Input, TitleText } from '@/ui/atoms';
import { PasswordReset } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isModalOpen, toggleModal] = useToggle();
  const [isPending, setIsPending] = useState(false);

  const user = TelegramApi.initDataUnsafe.user;

  const onSubmit = () => {
    if (password.length < 8) {
      setIsPasswordValid(false);

      return;
    }

    const decryptedMnemonic = cryptoApi.getDecryptedMnemonic(location.state.mnemonic, password);
    if (!decryptedMnemonic) {
      setIsPasswordValid(false);

      return;
    }

    walletModel.input.walletCreated(decryptedMnemonic);
    setIsPending(true);

    TelegramApi.getItem(BACKUP_DATE)
      .then(backupDate => {
        localStorage.setItem(TelegramApi.getStoreName(BACKUP_DATE), backupDate);
        navigate($path('/dashboard'));
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <>
      <MainButton progress={isPending} disabled={password.length === 0 || isModalOpen} onClick={onSubmit} />
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={user?.photo_url}
          size="lg"
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
          className="h-[64px] w-[64px]"
          name={user?.first_name[0]}
        />
        <TitleText className="m-4 px-6">Welcome back, {user?.first_name || 'friend'}!</TitleText>
        <BodyText as="span" className="mb-8 px-6 text-text-hint">
          We&apos;ve found a backup of your existing Telenova wallet in the cloud. To get access to it just enter the
          password you used when creating the wallet
        </BodyText>
        <div className="w-full max-w-sm text-start">
          <Input
            isClearable
            placeholder="Enter Password Here"
            type="password"
            value={password}
            isInvalid={!isPasswordValid}
            errorMessage={!isPasswordValid && 'It seems your password is incorrect'}
            onValueChange={value => {
              setPassword(value);
              setIsPasswordValid(true);
            }}
            onClear={() => {
              setPassword('');
              setIsPasswordValid(true);
            }}
          />
          <Button aria-label="Reset Password" className="self-baseline bg-transparent p-0" onClick={toggleModal}>
            <BodyText className="text-text-link">Forgot Password?</BodyText>
          </Button>
        </div>

        <PasswordReset isOpen={isModalOpen} onClose={toggleModal} />
      </div>
    </>
  );
};

export default Page;
