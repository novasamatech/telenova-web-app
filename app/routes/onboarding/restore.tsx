import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button } from '@nextui-org/react';
import { useLocation } from '@remix-run/react';
import { useUnit } from 'effector-react';
import { $path } from 'remix-routes';

import { MainButton } from '@/common/telegram/MainButton';
import { initializeWalletFromCloud } from '@/common/wallet';
import { telegramModel, walletModel } from '@/models';
import { telegramApi } from '@/shared/api';
import { BACKUP_DATE } from '@/shared/helpers';
import { useToggle } from '@/shared/hooks';
import { BodyText, Input, TitleText } from '@/ui/atoms';
import { PasswordReset } from '@/ui/molecules';

const Page = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const webApp = useUnit(telegramModel.$webApp);
  const user = useUnit(telegramModel.$user);

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isModalOpen, toggleModal] = useToggle();
  const [isPending, setIsPending] = useState(false);

  if (!webApp) return null;

  const onSubmit = () => {
    if (password.length < 8) {
      setIsPasswordValid(false);

      return;
    }

    const decryptedMnemonic = initializeWalletFromCloud(password, location.state.mnemonic);
    if (!decryptedMnemonic) return;

    walletModel.input.walletCreated(decryptedMnemonic);
    setIsPasswordValid(true);
    setIsPending(true);

    telegramApi
      .getCloudStorageItem(webApp, BACKUP_DATE)
      .then(backupDate => {
        localStorage.setItem(telegramApi.getStoreName(webApp, BACKUP_DATE), backupDate);
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
            errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
            onValueChange={setPassword}
            onClear={() => setPassword('')}
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
