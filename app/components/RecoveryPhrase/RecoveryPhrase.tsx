import { useState } from 'react';

import { Plate } from '../Plate';
import { BodyText, MediumTitle } from '../Typography';

import { cnTw } from '@/shared/helpers/twMerge';

import { RecoveryModal } from './RecoveryModal';

type Props = {
  mnemonic: string | null;
};

export const RecoveryPhrase = ({ mnemonic }: Props) => {
  const [isBlur, setIsBlur] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!isBlur) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    setIsBlur(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <Plate className="w-full px-2 py-4 relative">
        <button disabled={!isBlur} onClick={handleClick}>
          <div className={cnTw('flex flex-wrap justify-center gap-1', isBlur ? 'blur' : 'cursor-default')}>
            <BodyText className="text-text-danger mb-4 w-full">Do not share this with anyone!</BodyText>
            {!mnemonic && <MediumTitle>Mnemonic is missing!</MediumTitle>}

            {mnemonic?.split(' ').map((word, index) => (
              <BodyText
                align="left"
                key={word}
                as="span"
                className="px-[10px] py-[5px] bg-bg-primary rounded-[10px] w-[32%]"
              >
                <span className="text-text-on-button-disabled">{index + 1} </span> {word}
              </BodyText>
            ))}
          </div>
          {isBlur && <MediumTitle className="absolute left-1/3 bottom-1/2">Tap to reveal secret</MediumTitle>}
        </button>
      </Plate>

      <RecoveryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
    </>
  );
};
