import { Suspense, lazy, useEffect, useRef, useState } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

import { useChainRegistry } from '@/common/chainRegistry';
import { type ChainAsset, ConnectionStatus } from '@/common/chainRegistry/types';
import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { useQueryService } from '@/common/queryService/QueryService';
import { AssetType, type PublicKey } from '@/common/types';
import { formatAmount, formatBalance, getGiftInfo } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks';
import { BigTitle, Icon, Shimmering } from '@/components';

// TODO replace with LottiePlayer
const LazyLottie = lazy(() => import('react-lottie-player'));

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
  const { sendTransaction, handleFee } = useExtrinsic();
  const { getAssetBySymbol, connectionStates } = useChainRegistry();
  const { getFreeBalance } = useQueryService();
  const { getGiftBalanceStatemine } = useAssetHub();

  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);

  const lottieRef = useRef();

  const getGiftBalance = async (chain: ChainAsset, giftAddress: string) => {
    const timerID = setTimeout(() => {
      setGiftBalance('-');
    }, 5500);

    const giftBalance = await getFreeBalance(giftAddress, chain.chain.chainId);
    if (giftBalance === '0') {
      clearTimeout(timerID);

      return '0';
    }
    const fee = await handleFee(chain.chain.chainId, TransactionType.TRANSFER_ALL);
    clearTimeout(timerID);
    const rawBalance = +giftBalance - fee;
    const formattedBalance = formatBalance(rawBalance.toString(), chain.asset.precision).formattedValue;

    return formattedBalance;
  };

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) {
      return;
    }
    setIsOpen(true);

    (async () => {
      const { giftAddress, chain, symbol } = await getGiftInfo(publicKey, startParam, getAssetBySymbol);
      if (connectionStates[chain.chain.chainId].connectionStatus === ConnectionStatus.NONE) {
        return;
      }

      const balance =
        chain.asset?.type === AssetType.STATEMINE
          ? await getGiftBalanceStatemine(chain.chain.chainId, chain.asset, giftAddress)
          : await getGiftBalance(chain, giftAddress);

      setGiftStatus(balance === '0' ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
      setGiftSymbol(balance === '0' ? '' : symbol);

      setGiftBalance(balance);
    })();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [startParam, publicKey, isGiftClaimed, connectionStates]);

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

    sendTransaction({
      destinationAddress: chainAddress,
      chainId: chain.chain.chainId,
      transferAmount: formatAmount(giftBalance, chain.asset.precision),
      asset: chain.asset,
      keyring,
      transferAll: true,
    })
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
                  <Suspense>
                    <LazyLottie
                      path={`/gifs/Gift_claim_${giftSymbol}.json`}
                      play
                      className="w-[248px] h-[248px] m-auto"
                      ref={lottieRef}
                      loop={false}
                      onEnterFrame={handleFrame}
                      onComplete={handleComplete}
                    />
                  </Suspense>
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
