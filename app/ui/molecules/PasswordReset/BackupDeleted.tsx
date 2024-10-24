import { Button, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';

import { BigTitle, Icon, MediumTitle } from '@/ui/atoms';

type Props = {
  onClose: () => void;
};

export const BackupDeleted = ({ onClose }: Props) => (
  <>
    <ModalHeader className="p-4">
      <BigTitle>Backup Deleted</BigTitle>
    </ModalHeader>
    <ModalBody className="gap-4 px-4">
      <Icon name="ResetPasswordDone" size={96} className="self-center" />
      <MediumTitle align="center">Your backup has been deleted</MediumTitle>
    </ModalBody>
    <ModalFooter className="flex-col justify-center">
      <Button color="primary" className="h-[50px] w-full rounded-full" onPress={onClose}>
        <MediumTitle className="text-white">Close</MediumTitle>
      </Button>
    </ModalFooter>
  </>
);
