import { Button, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';

import { BigTitle, Icon, MediumTitle } from '@/components';

type Props = {
  onClose: () => void;
};

export default function BackupDeleted({ onClose }: Props) {
  return (
    <>
      <ModalHeader className="p-4">
        <BigTitle>Backup Deleted</BigTitle>
      </ModalHeader>
      <ModalBody className="gap-4 px-4">
        <Icon name="ResetPasswordDone" size={96} className="self-center" />
        <MediumTitle align="center">Your backup has been deleted</MediumTitle>
      </ModalBody>
      <ModalFooter className="flex-col justify-center">
        <Button color="primary" className="w-full rounded-full h-[50px]" onPress={onClose}>
          <MediumTitle className="text-white">Close</MediumTitle>
        </Button>
      </ModalFooter>
    </>
  );
}
