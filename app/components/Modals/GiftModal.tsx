import { useEffect, useState } from 'react';

import { type PlayerEvent } from '@lottiefiles/react-lottie-player';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { type AnimationItem } from 'lottie-web';

import { type BN, BN_ZERO } from '@polkadot/util';

import { useAssetHub } from '../../shared/hooks';
import { Icon } from '../Icon/Icon';
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
import { Shimmering } from '../Shimmering/Shimmering';
import { BigTitle } from '../Typography';

import { TransactionType, useExtrinsic } from '@/common/extrinsicService';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { useQueryService } from '@/common/queryService/QueryService';
import { networkModel } from '@/models';
import { getGiftInfo, toPrecisedBalance } from '@/shared/helpers';
import { type Asset, type StatemineAsset } from '@/types/substrate';

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
  const { startParam, webApp } = useTelegram();
  const { getFreeBalance } = useQueryService();
  const { getGiftBalanceStatemine } = useAssetHub();
  const { sendTransfer, getTransactionFee } = useExtrinsic();
  const { publicKey, isGiftClaimed, setIsGiftClaimed } = useGlobalContext();

  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState(BN_ZERO);
  const [giftStatus, setGiftStatus] = useState<GIFT_STATUS | null>(null);

  const [lottie, setLottie] = useState<AnimationItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const getGiftBalance = async (chainId: ChainId, giftAddress: string): Promise<BN> => {
    const timerID = setTimeout(() => {
      setGiftBalance(BN_ZERO);
    }, 5500);

    const giftBalance = await getFreeBalance(giftAddress, chainId);
    if (giftBalance.isZero()) {
      clearTimeout(timerID);

      return BN_ZERO;
    }
    const fee = await getTransactionFee(chainId, TransactionType.TRANSFER_ALL);
    clearTimeout(timerID);
    const rawBalance = giftBalance.sub(fee);

    return rawBalance.isNeg() ? BN_ZERO : rawBalance;
  };

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) return;
    setIsOpen(true);

    const giftInfo = getGiftInfo(Object.values(chains), publicKey, startParam);
    if (!giftInfo || connections[giftInfo.chainId].status === 'disconnected') return;

    const { chainId, asset, giftAddress, symbol } = giftInfo;

    const balanceRequest: Record<Asset['type'], (chainId: ChainId, address: Address, asset?: Asset) => Promise<BN>> = {
      native: (chainId, address) => getGiftBalance(chainId, address),
      orml: (chainId, address) => getGiftBalance(chainId, address),
      statemine: (chainId, address, asset) => getGiftBalanceStatemine(chainId, address, asset as StatemineAsset),
    };

    balanceRequest[asset.type](chainId, giftAddress, asset).then(balance => {
      setGiftStatus(balance.isZero() ? GIFT_STATUS.CLAIMED : GIFT_STATUS.NOT_CLAIMED);
      setGiftSymbol(balance.isZero() ? '' : symbol);
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
    const giftInfo = getGiftInfo(Object.values(chains), publicKey!, startParam!);
    if (!giftInfo) return;

    setIsDisabled(true);
    if (giftBalance.isZero()) {
      handleClose();

      return;
    }
    clearTimeout(timeoutId);

    if (lottie) {
      lottie.play();
    }

    sendTransfer({
      chainId: giftInfo.chainId,
      asset: giftInfo.asset,
      destinationAddress: giftInfo.address,
      transferAmount: toPrecisedBalance(giftBalance.toString(), giftInfo.asset.precision),
      transferAll: true,
      keyringPair: giftInfo.keyring,
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
