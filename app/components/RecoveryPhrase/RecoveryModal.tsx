import { useState } from 'react';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';

import { type IconNames } from '../Icon/types';

import { BigTitle, BodyText, Icon } from '@/components';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const checkboxes = [
  {
    id: 'checkbox-1',
    iconName: 'Blind',
    label: (
      <>
        Having the recovery phrase means having{' '}
        <strong className="text-text-primary">total and permanent access to all connected wallets</strong> and the money
        within them.
      </>
    ),
  },
  {
    id: 'checkbox-2',
    iconName: 'Pen',
    label: (
      <>
        Do not enter your recovery phrase or private key into any form or app. They are
        <strong className="text-text-primary"> not needed for app functionality.</strong>
      </>
    ),
  },
  {
    id: 'checkbox-3',
    iconName: 'UserBlock',
    label: (
      <>
        Support or <strong className="text-text-primary">admins will never request your recovery phrase</strong> or
        private key under any circumstances.
      </>
    ),
  },
];

export default function RecoveryModal({ isOpen, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <>
      <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="">
            <BigTitle>Read this carefully</BigTitle>
          </ModalHeader>
          <CheckboxGroup color="default" value={selected} onValueChange={setSelected}>
            <ModalBody className="gap-6 mb-2">
              {checkboxes.map(({ id, iconName, label }) => (
                <div className="flex flex-col items-center" key={iconName}>
                  <Icon name={iconName as IconNames} size={32} />
                  <Checkbox value={id} className="items-start">
                    <BodyText align="left" className="text-text-hint">
                      {label}
                    </BodyText>
                  </Checkbox>
                </div>
              ))}
            </ModalBody>
          </CheckboxGroup>
          <ModalFooter className="justify-center">
            <Button
              color="primary"
              className="w-full rounded-full h-[50px]"
              isDisabled={selected.length !== 3}
              onPress={onSubmit}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
