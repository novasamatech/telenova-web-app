import { useEffect, useState } from 'react';

import { type PlayerEvent } from '@lottiefiles/react-lottie-player';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { type AnimationItem } from 'lottie-web';

import { Icon } from '../Icon/Icon';
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
import { Shimmering } from '../Shimmering/Shimmering';
import { BigTitle } from '../Typography';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { useQueryService } from '@/common/queryService/QueryService';
import { type ChainAsset } from '@/common/types';
import { formatAmount, formatBalance, getGiftInfo, isStatemineAsset } from '@/common/utils';
import { useAssetHub } from '@/common/utils/hooks';
import { networkModel } from '@/models';

const enum GIFT_STATUS {
  NOT_CLAIMED,
  CLAIMED,
}

const PAUSE_DURATION = 3015;

type GiftStatusType = {
  [key in GIFT_STATUS]: { text: string; btnText: string };
};

const GIFTS: GiftStatusType = {
  [GIFT_STATUS.NOT_CLAIMED]: { text: 'Claim your gift', btnText: 'Claim' },
  [GIFT_STATUS.CLAIMED]: { text: 'Gift was claimed', btnText: 'Okay' },
};

let timeoutId: ReturnType<typeof setTimeout>;

export const GiftModal = () => {
  const { publicKey, isGiftClaimed, setIsGiftClaimed } = useGlobalContext();
  const { startParam, webApp } = useTelegram();
  const { sendTransfer, getTransactionFee } = useExtrinsic();
  const { getFreeBalance } = useQueryService();
  const { getGiftBalanceStatemine } = useAssetHub();

  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);
  const [lottie, setLottie] = useState<AnimationItem | null>(null);

  const getGiftBalance = async (chain: ChainAsset, giftAddress: string) => {
    const timerID = setTimeout(() => {
      setGiftBalance('-');
    }, 5500);

    const giftBalance = await getFreeBalance(giftAddress, chain.chain.chainId);
    if (giftBalance === '0') {
      clearTimeout(timerID);

      return '0';
    }
    const fee = await getTransactionFee(chain.chain.chainId, TransactionType.TRANSFER_ALL);
    clearTimeout(timerID);
    const rawBalance = +giftBalance - fee;

    return formatBalance(rawBalance.toString(), chain.asset.precision).formattedValue;
  };

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) return;
    setIsOpen(true);

    const { giftAddress, chain, symbol } = getGiftInfo(Object.values(chains), publicKey, startParam);
    if (connections[chain.chain.chainId].status === 'disconnected') return;

    const balanceRequest = {
      statemine: () => getGiftBalanceStatemine(chain.chain.chainId, chain.asset, giftAddress),
      default: () => getGiftBalance(chain, giftAddress),
    };

    balanceRequest[isStatemineAsset(chain.asset?.type) ? 'statemine' : 'default']().then(balance => {
      setGiftStatus(balance === '0' ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
      setGiftSymbol(balance === '0' ? '' : symbol);
      setGiftBalance(balance);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [startParam, publicKey, isGiftClaimed, connections]);

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

    if (lottie) {
      lottie.play();
    }

    const { chainAddress, chain, keyring } = getGiftInfo(Object.values(chains), publicKey!, startParam!);

    sendTransfer({
      destinationAddress: chainAddress,
      chainId: chain.chain.chainId,
      transferAmount: formatAmount(giftBalance, chain.asset.precision),
      asset: chain.asset,
      transferAll: true,
      keyring,
    })
      .catch(() => {
        webApp?.showAlert('Something went wrong. Failed to claim gift');
        handleClose();
      })
      .finally(() => {
        setIsGiftClaimed(true);
        if (lottie && lottie.totalFrames - 1 === lottie.currentFrame) {
          setIsOpen(false);
        }
      });
  };

  const handlePlayerEvent = (event: PlayerEvent) => {
    if (!lottie) return;

    switch (event) {
      case 'frame':
        if (!timeoutId) {
          timeoutId = setTimeout(() => lottie.pause(), PAUSE_DURATION);
        }
        break;

      case 'complete':
        if (isGiftClaimed) {
          setIsOpen(false);
        }
        break;
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
                  <LottiePlayer
                    autoplay
                    loop={false}
                    className="w-[248px] h-[248px] m-auto"
                    src={`/gifs/Gift_claim_${giftSymbol}.json`}
                    lottieRef={setLottie}
                    onEvent={handlePlayerEvent}
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
};
