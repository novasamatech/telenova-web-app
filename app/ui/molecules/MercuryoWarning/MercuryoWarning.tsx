import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

import { BigTitle, BodyText, Icon, MediumTitle } from '@/ui/atoms';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const MercuryoWarning = ({ isOpen, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      size="xs"
      placement="center"
      isDismissable={false}
      classNames={{
        closeButton: 'mt-2 text-2xl text-icon-neutral',
      }}
      className="max-h-[93vh] overflow-y-auto"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>
          <BigTitle>Mercuryo is unavailable</BigTitle>
        </ModalHeader>
        <ModalBody className="gap-4 px-4">
          <Icon name="ResetPassword" size={96} className="self-center" />
          <BodyText className="text-balance text-text-hint">
            Buy & Sell with Mercuryo widget is not supported in web version.
            <br />
            Proceed with desktop or mobile application.
          </BodyText>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button color="primary" className="h-[50px] w-full rounded-full" onPress={onClose}>
            <MediumTitle className="text-white">Confirm</MediumTitle>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
