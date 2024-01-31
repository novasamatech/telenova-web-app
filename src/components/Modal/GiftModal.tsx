import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import Rive from '@rive-app/react-canvas-lite';

import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { useChainRegistry } from '@/common/chainRegistry';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { claimGift } from '@/common/utils/extrinsics';
import { useBalances } from '@/common/balances/BalanceProvider';
import { getGiftInfo } from '@/common/utils/gift';
import { PublicKey } from '@/common/types';
import { CaptionText } from '@/components/Typography';
import Shimmering from '@/components/Shimmering/Shimmering';

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
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) {
      return;
    }
    setIsOpen(true);

    (async () => {
      const { giftAddress, chain } = await getGiftInfo(publicKey, startParam, getAssetBySymbol);
      const balance = await getFreeBalance(giftAddress, chain.chain.chainId);
      setGiftBalance(balance);
      setGiftStatus(balance === '0' ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
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
        setIsOpen(false);
        setIsGiftClaimed(true);
      });
  };

  return (
    <>
      <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={handleClose}>
        <ModalContent>
          <ModalHeader>You have a gift</ModalHeader>
          {giftStatus !== null ? (
            <>
              <ModalBody>
                <Rive src="/gifs/new_file.riv" className="w-[210px] h-[170px] m-auto" />
                <CaptionText align="center">{GIFTS[giftStatus].text} </CaptionText>
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
