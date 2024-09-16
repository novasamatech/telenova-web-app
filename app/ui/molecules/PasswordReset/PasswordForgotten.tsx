import { useState } from 'react';

import { Button, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';

import { walletModel } from '@/models/wallet';
import { BigTitle, BodyText, Countdown, Icon, MediumTitle } from '@/ui/atoms';

type Props = {
  onSubmit: () => void;
  onClose: () => void;
};

export const PasswordForgotten = ({ onClose, onSubmit }: Props) => {
  const [isDisabled, setIsDisabled] = useState(true);

  const handleClose = () => {
    setIsDisabled(true);
    onClose();
  };

  const handleSubmit = () => {
    setIsDisabled(true);
    walletModel.input.walletCleared({ clearRemote: true });
    onSubmit();
  };

  return (
    <>
      <ModalHeader className="p-4">
        <BigTitle>Forgot password?</BigTitle>
      </ModalHeader>
      <ModalBody className="gap-4 px-4">
        <Icon name="ResetPassword" size={96} className="self-center" />
        <BodyText className="text-text-hint">
          You are the only owner of your password, which is not stored anywhere in Telenova. Without a backup password,
          you cannot access your account or funds. If you lose or forget your password the only option is to delete the
          current backup and its associated account before creating a new one.
        </BodyText>
        <BodyText className="font-bold text-text-on-button-danger">
          You will lose your funds and access to the account after Deleting Backup. Delete Backup is your option only if
          you cannot restore the Password at all.
        </BodyText>
      </ModalBody>
      <ModalFooter className="flex-col justify-center">
        <Button
          className="h-[50px] w-full rounded-full bg-text-on-button-danger"
          isDisabled={isDisabled}
          onPress={handleSubmit}
        >
          <MediumTitle className="text-white">
            Delete Backup <Countdown initValue={60} onFinish={() => setIsDisabled(false)} />
          </MediumTitle>
        </Button>
        <Button className="h-[50px] w-full rounded-full bg-bg-input" onPress={handleClose}>
          <MediumTitle>Cancel</MediumTitle>
        </Button>
      </ModalFooter>
    </>
  );
};
