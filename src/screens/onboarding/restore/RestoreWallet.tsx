import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { Avatar, Input } from '@nextui-org/react';
import { BodyText, TitleText } from '@/components/Typography';
import { Paths } from '@/common/routing';
import { createWallet, initializeWalletFromCloud, resetWallet } from '@/common/wallet';

type Props = {
  mnemonic: string;
};

export const RestoreWalletPage = ({ mnemonic }: Props) => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const { setPublicKey } = useGlobalContext();

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    mainButton.show();
    mainButton.disable();
  }, []);

  useEffect(() => {
    const callback = () => {
      if (password.length < 8) {
        setIsPasswordValid(false);

        return;
      }
      const decryptedMnemonic = initializeWalletFromCloud(password, mnemonic);
      const wallet = createWallet(decryptedMnemonic);
      setIsPasswordValid(Boolean(wallet));
      if (wallet) {
        setPublicKey(wallet?.publicKey);
        navigate(Paths.DASHBOARD);
      }
    };

    if (password.length) {
      mainButton.enable();
      addMainButton(callback);
    } else {
      mainButton.disable();
    }

    return () => {
      reset();
    };
  }, [password]);

  function clearWallet() {
    resetWallet();
    reset();
    navigate(Paths.ONBOARDING);
  }

  return (
    <>
      <Avatar src={user?.photo_url} size="lg" className="w-[64px] h-[64px]" name={user?.first_name[0]} />
      <TitleText className="m-4 px-6">Welcome back {user?.first_name || 'friend'}!</TitleText>
      <BodyText as="span" className="text-text-hint px-6 mb-8">
        We&apos;ve discovered a backup of your existing wallet in the cloud. To restore it just enter your password.
      </BodyText>
      <Input
        isClearable
        variant="flat"
        placeholder="Enter 8-character password here"
        type="password"
        className="max-w-sm text-left"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1',
            'group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
        }}
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
      <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
        Reset Wallet
      </button>
    </>
  );
};
