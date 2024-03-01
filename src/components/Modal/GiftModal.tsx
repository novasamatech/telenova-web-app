import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import Lottie from 'react-lottie-player';

import { useExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { useChainRegistry } from '@/common/chainRegistry';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { claimGift, handleFeeTrasferAll } from '@/common/utils/extrinsics';
import { useBalances } from '@/common/balances/BalanceProvider';
import { getGiftInfo } from '@/common/utils/gift';
import { PublicKey } from '@/common/types';
import { BigTitle, Icon, Shimmering } from '@/components';
import { formatBalance } from '@/common/utils/balance';
import { ChainAsset } from '@/common/chainRegistry/types';

enum GIFT_STATUS {
  NOT_CLAIMED,
  CLAIMED,
}

type GiftStatusType = {
  [key in GIFT_STATUS]: { text: string; btnText: string };
};

const GIFTS: GiftStatusType = {
  [GIFT_STATUS.NOT_CLAIMED]: { text: 'Claim your gift', btnText: 'Claim' },
  [GIFT_STATUS.CLAIMED]: { text: 'Gift was claimed', btnText: 'Okay' },
};
let timeoutId: ReturnType<typeof setTimeout>;

export default function GiftModal() {
  const { publicKey, isGiftClaimed, setIsGiftClaimed } = useGlobalContext();
  const { startParam, webApp } = useTelegram();
  const { submitExtrinsic, estimateFee } = useExtrinsicProvider();
  const { getAssetBySymbol } = useChainRegistry();
  const { getFreeBalance } = useBalances();

  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);

  const lottieRef = useRef();

  const showBalance = async (chain: ChainAsset, balance: string) => {
    const timerID = setTimeout(() => {
      setGiftBalance('-');
    }, 5500);

    const fee = await handleFeeTrasferAll(estimateFee, chain.chain.chainId);
    clearTimeout(timerID);
    const formattedFee = Number(formatBalance(fee.toString(), chain.asset.precision).formattedValue);
    const { formattedValue } = formatBalance(balance, chain.asset.precision);
    const formattedBalance = parseFloat((+formattedValue - formattedFee).toFixed(4));

    return formattedBalance;
  };

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) {
      return;
    }
    setIsOpen(true);

    (async () => {
      const { giftAddress, chain, symbol } = await getGiftInfo(publicKey, startParam, getAssetBySymbol);
      const balance = await getFreeBalance(giftAddress, chain.chain.chainId);
      setGiftStatus(balance === '0' ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
      setGiftSymbol(balance === '0' ? '' : symbol);

      if (balance === '0') {
        setGiftBalance(balance);
      } else {
        showBalance(chain, balance).then((giftBalance) => {
          setGiftBalance(giftBalance.toString());
        });
      }
    })();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [startParam, publicKey, isGiftClaimed]);

  const handleClose = () => {
    clearTimeout(timeoutId);
    setIsOpen(false);
    if (giftBalance) {
      setIsGiftClaimed(true);
    }
  };

  const handleGiftClaim = async () => {
    setIsDisabled(true);
    if (giftBalance === '0') {
      handleClose();

      return;
    }
    clearTimeout(timeoutId);
    if (lottieRef.current) {
      // @ts-expect-error no types
      lottieRef.current.play();
    }

    const { chainAddress, chain, keyring } = await getGiftInfo(
      publicKey as PublicKey,
      startParam as string,
      getAssetBySymbol,
    );
    claimGift(keyring, chainAddress, chain.chain.chainId, submitExtrinsic)
      .catch(() => {
        webApp?.showAlert('Something went wrong. Failed to claim gift');
        handleClose();
      })
      .finally(() => {
        setIsGiftClaimed(true);
        // @ts-expect-error no types
        if (lottieRef.current && lottieRef.current.totalFrames - 1 === lottieRef.current.currentFrame) {
          setIsOpen(false);
        }
      });
  };

  // opt:  lib to change balance - animate
  const handleFrame = () => {
    // @ts-expect-error no types
    if (lottieRef.current && lottieRef.current.currentFrame === 0) {
      // @ts-expect-error no types
      timeoutId = setTimeout(() => lottieRef.current && lottieRef.current.pause(), 3015);
    }
  };

  const handleComplete = () => {
    if (lottieRef.current && isGiftClaimed) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="xs"
        placement="center"
        isDismissable={false}
        classNames={{
          header: 'p-4 pb-1',
          footer: 'p-4 pt-1',
          closeButton: 'mt-[10px]',
        }}
        className="h-[450px]"
        onClose={handleClose}
      >
        <ModalContent>
          {giftStatus !== null ? (
            <>
              <ModalHeader className="text-center">
                <BigTitle> {GIFTS[giftStatus].text}</BigTitle>
              </ModalHeader>
              <ModalBody>
                {giftStatus === GIFT_STATUS.NOT_CLAIMED ? (
                  <Lottie
                    path={`/gifs/Gift_claim_${giftSymbol}.json`}
                    play
                    className="w-[248px] h-[248px] m-auto"
                    ref={lottieRef}
                    loop={false}
                    onEnterFrame={handleFrame}
                    onComplete={handleComplete}
                  />
                ) : (
                  <Icon name="GiftClaimed" className="w-[248px] h-[248px] m-auto" />
                )}
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  color="primary"
                  className="w-full h-[50px] rounded-full"
                  isDisabled={isDisabled}
                  isLoading={!giftBalance}
                  onPress={handleGiftClaim}
                >
                  {GIFTS[giftStatus].btnText} {giftStatus === GIFT_STATUS.NOT_CLAIMED && `${giftBalance} ${giftSymbol}`}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader className="text-center">
                <Shimmering width={200} height={30} className="rounded-full" />
              </ModalHeader>
              <ModalBody>
                <Icon name="PendingGift" className="w-[170px] h-[170px] m-auto" />
              </ModalBody>
              <ModalFooter className="justify-center">
                <Shimmering height={50} width={300} className="w-full rounded-full" />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
