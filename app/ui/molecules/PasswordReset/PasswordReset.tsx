import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal, ModalContent } from '@nextui-org/react';
import { $path } from 'remix-routes';

import { walletModel } from '@/models/wallet';

import { BackupDeleted } from './BackupDeleted';
import { PasswordForgotten } from './PasswordForgotten';

const enum Step {
  INIT,
  BACKUP_DELETED,
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const PasswordReset = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(Step.INIT);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    walletModel.input.walletCleared({ clearRemote: true });
    setStep(Step.BACKUP_DELETED);
  };

  const handleClose = () => {
    onClose();
    if (step === Step.BACKUP_DELETED) {
      navigate($path('/onboarding/start'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="xs"
      placement="center"
      classNames={{
        closeButton: 'mt-2 text-2xl text-icon-neutral',
      }}
      className="max-h-[93vh] overflow-y-auto"
      onClose={handleClose}
    >
      <ModalContent>
        {step === Step.INIT && <PasswordForgotten onClose={onClose} onSubmit={handleSubmit} />}
        {step === Step.BACKUP_DELETED && <BackupDeleted onClose={handleClose} />}
      </ModalContent>
    </Modal>
  );
};
