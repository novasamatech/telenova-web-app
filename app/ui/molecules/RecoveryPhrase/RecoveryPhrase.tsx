import { useState } from 'react';

import { cnTw } from '@/shared/helpers/twMerge';
import { BodyText, MediumTitle, Plate } from '@/ui/atoms';

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
      <Plate className="relative w-full px-2 py-4">
        <button disabled={!isBlur} onClick={handleClick}>
          <div className={cnTw('flex flex-wrap justify-center gap-1', isBlur ? 'blur' : 'cursor-default')}>
            <BodyText className="mb-4 w-full text-text-danger">Do not share this with anyone!</BodyText>
            {!mnemonic && <MediumTitle>Mnemonic is missing!</MediumTitle>}

            {mnemonic?.split(' ').map((word, index) => (
              <BodyText
                align="left"
                key={word}
                as="span"
                className="w-[32%] rounded-[10px] bg-bg-primary px-[10px] py-[5px]"
              >
                <span className="text-text-on-button-disabled">{index + 1} </span> {word}
              </BodyText>
            ))}
          </div>
          {isBlur && <MediumTitle className="absolute bottom-1/2 left-1/3">Tap to reveal secret</MediumTitle>}
        </button>
      </Plate>

      <RecoveryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
    </>
  );
};
