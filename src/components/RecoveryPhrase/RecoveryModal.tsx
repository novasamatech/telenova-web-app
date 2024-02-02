import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from '@nextui-org/react';
import Image from 'next/image';

import { BodyText, TitleText } from '@/components/Typography';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function RecoveryModal({ isOpen, onClose, onSubmit }: Props) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="p-0 h-[220px]">
            <Image src="/images/Modal.png" alt="Logo" className="w-full" width={300} height={220} />
          </ModalHeader>
          <ModalBody className="mt-4 gap-4 py-0">
            <TitleText align="left">Never send your secret to anyone </TitleText>
            <BodyText align="left" className="text-text-hint">
              It can lead to permanent funds loss. Even if admin will ask you about it. Even if you need to. Do not
              share your secret phrase
            </BodyText>
            <Checkbox color="default" isSelected={isSelected} onValueChange={setIsSelected}>
              <BodyText align="left" className="text-text-hint">
                I understand that sharing or showing a secret of my accounts with anyone can lead to a permanent funds
                loss
              </BodyText>
            </Checkbox>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="primary" className="w-[250px] rounded-full" isDisabled={!isSelected} onPress={onSubmit}>
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
