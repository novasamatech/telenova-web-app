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
        <ModalBody className="gap-y-4 px-4">
          <Icon name="WarningWindow" size={128} className="self-center" />
          <BodyText className="text-balance text-text-hint">
            Web version does not support Buy&nbsp;&&nbsp;Sell feature with Mercuryo widget
            <br />
            Proceed with desktop or mobile application
          </BodyText>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button color="primary" className="h-[50px] w-full rounded-full" onPress={onClose}>
            <MediumTitle className="text-white">Okay</MediumTitle>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
