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

import { Icon } from '../Icon/Icon';
import { type IconNames } from '../Icon/types';
import { BigTitle, BodyText } from '../Typography';

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

export const RecoveryModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="">
          <BigTitle>Read this carefully</BigTitle>
        </ModalHeader>
        <CheckboxGroup color="default" value={selected} onValueChange={setSelected}>
          <ModalBody className="mb-2 gap-6">
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
            className="h-[50px] w-full rounded-full"
            isDisabled={selected.length !== 3}
            onPress={onSubmit}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
