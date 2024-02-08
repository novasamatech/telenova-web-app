import { useState } from 'react';

import { getMnemonic } from '@/common/wallet';
import { cnTw } from '@/common/utils/twMerge';
import { BodyText, MediumTitle, Plate } from '@/components';
import RecoveryModal from './RecoveryModal';

const RecoveryPhrase = () => {
  const [isBlur, setIsBlur] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mnemonic = getMnemonic();

  const handleClick = () => {
    if (!isBlur) return;
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    setIsBlur(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <Plate className="w-full p-2 relative">
        <button disabled={!isBlur} onClick={handleClick}>
          <div className={cnTw('flex flex-wrap justify-center gap-1', isBlur ? 'blur' : 'cursor-default')}>
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
            <BodyText className="text-text-hint mt-3 mb-2">Do not share this with anyone!</BodyText>
          </div>
          {isBlur && <MediumTitle className="absolute left-1/3 bottom-1/2">Tap to reveal secret</MediumTitle>}
        </button>
      </Plate>
      <RecoveryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
    </>
  );
};

export default RecoveryPhrase;
