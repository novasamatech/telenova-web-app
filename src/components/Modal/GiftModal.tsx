import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import Lottie from 'react-lottie-player';

import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { useChainRegistry } from '@/common/chainRegistry';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { claimGift } from '@/common/utils/extrinsics';
import { useBalances } from '@/common/balances/BalanceProvider';
import { getGiftInfo } from '@/common/utils/gift';
import { PublicKey } from '@/common/types';
import { Icon, Shimmering, MediumTitle, TitleText } from '@/components';

enum GIFT_STATUS {
  NOT_CLAIMED,
  CLAIMED,
}

type GiftStatusType = {
  [key in GIFT_STATUS]: { text: string; btnText: string };
};

const GIFTS: GiftStatusType = {
  [GIFT_STATUS.NOT_CLAIMED]: { text: 'Claim your gift', btnText: 'Claim' },
  [GIFT_STATUS.CLAIMED]: { text: 'Seems like the gift was already claimed', btnText: 'Okay' },
};

export default function GiftModal() {
  const { publicKey, isGiftClaimed, setIsGiftClaimed } = useGlobalContext();
  const { startParam } = useTelegram();
  const { submitExtrinsic } = useExtrinsicProvider();
  const { getAssetBySymbol } = useChainRegistry();
  const { getFreeBalance } = useBalances();

  const [isOpen, setIsOpen] = useState(false);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);

  const lottieRef = useRef();

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) {
      return;
    }
    setIsOpen(true);

    (async () => {
      const { giftAddress, chain, symbol } = await getGiftInfo(publicKey, startParam, getAssetBySymbol);
      const balance = await getFreeBalance(giftAddress, chain.chain.chainId);
      setGiftBalance(balance);
      setGiftStatus(balance === '0' ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
      setGiftSymbol(balance === '0' ? '' : symbol);
    })();
  }, [startParam, publicKey, isGiftClaimed]);

  const handleClose = () => {
    setIsOpen(false);
    if (giftBalance) {
      setIsGiftClaimed(true);
    }
  };

  const handleGiftClaim = async () => {
    if (giftBalance === '0') {
      handleClose();

      return;
    }

    const { chainAddress, chain, keyring } = await getGiftInfo(
      publicKey as PublicKey,
      startParam as string,
      getAssetBySymbol,
    );
    claimGift(keyring, chainAddress, chain.chain.chainId, submitExtrinsic)
      .then(() => {
        // TODO optimistic update balance
      })
      .catch(() => {
        alert('Something went wrong. Failed to claim gift');
      })
      .finally(() => {
        if (lottieRef.current) {
          // @ts-expect-error no types
          lottieRef.current.play();
        }
      });
  };

  const handleOnEvent = () => {
    setIsOpen(false);
    setIsGiftClaimed(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={handleClose}>
        <ModalContent>
          <ModalHeader>You have a gift</ModalHeader>
          {giftStatus !== null ? (
            <>
              <ModalBody>
                {giftStatus === GIFT_STATUS.NOT_CLAIMED ? (
                  <Lottie
                    keepLastFrame
                    path={`/gifs/Gift_claim_${giftSymbol}.json`}
                    className="player w-[210px] h-[170px] m-auto"
                    ref={lottieRef}
                    loop={false}
                    onComplete={handleOnEvent}
                  />
                ) : (
                  <Icon name="GiftClaimed" className="w-[210px] h-[220px] m-auto" />
                )}
                <TitleText align="center">{GIFTS[giftStatus].text} </TitleText>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button color="primary" className="w-[250px]" onPress={handleGiftClaim}>
                  {GIFTS[giftStatus].btnText}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <Shimmering width={250} height={20} className="mx-auto my-2" />
              <Shimmering width={150} height={20} className="mx-auto my-2" />
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
