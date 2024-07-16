import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, Button } from '@nextui-org/react';
import { useLocation } from '@remix-run/react';
import { $path } from 'remix-routes';

import { useGlobalContext, useTelegram } from '@/common/providers';
import { MainButton } from '@/common/telegram/MainButton';
import { BACKUP_DATE } from '@/common/utils';
import { createWallet, getCloudStorageItem, getStoreName, initializeWalletFromCloud } from '@/common/wallet';
import { BodyText, Input, ResetPasswordModal, TitleText } from '@/components';

const Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useTelegram();
  const { setPublicKey } = useGlobalContext();

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(isOpen => !isOpen);
  };

  const submit = () => {
    if (password.length < 8) {
      setIsPasswordValid(false);

      return;
    }

    const decryptedMnemonic = initializeWalletFromCloud(password, location.state.mnemonic);
    const wallet = createWallet(decryptedMnemonic);
    setIsPasswordValid(Boolean(wallet));
    if (wallet) {
      setIsPending(true);
      getCloudStorageItem(BACKUP_DATE).then(value => {
        value && localStorage.setItem(getStoreName(BACKUP_DATE), value);
        setPublicKey(wallet?.publicKey);
        setIsPending(false);
        navigate($path('/dashboard'));
      });
    }
  };

  return (
    <>
      <MainButton progress={isPending} disabled={password.length === 0 || isModalOpen} onClick={submit} />
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={user?.photo_url}
          size="lg"
          classNames={{
            base: 'bg-[--tg-theme-button-color]',
            name: 'font-manrope font-black text-base text-white',
          }}
          className="w-[64px] h-[64px]"
          name={user?.first_name[0]}
        />
        <TitleText className="m-4 px-6">Welcome back, {user?.first_name || 'friend'}!</TitleText>
        <BodyText as="span" className="text-text-hint px-6 mb-8">
          We&apos;ve found a backup of your existing Telenova wallet in the cloud. To get access to it just enter the
          password you used when creating the wallet
        </BodyText>
        <div className="max-w-sm w-full text-start">
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
          <Button aria-label="Reset Password" className="self-baseline p-0 bg-transparent" onClick={toggleModal}>
            <BodyText className="text-text-link">Forgot Password?</BodyText>
          </Button>
        </div>
        <ResetPasswordModal isOpen={isModalOpen} onClose={toggleModal} />
      </div>
    </>
  );
};

export default Page;