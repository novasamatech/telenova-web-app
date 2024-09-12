import { useEffect, useState } from 'react';

import { type PlayerEvent } from '@lottiefiles/react-lottie-player';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useUnit } from 'effector-react';
import { type AnimationItem } from 'lottie-web';

import { type ApiPromise } from '@polkadot/api';
import { type BN, BN_ZERO } from '@polkadot/util';

import { useGlobalContext } from '@/common/providers';
import { networkModel } from '@/models/network';
import { telegramModel } from '@/models/telegram';
import { walletModel } from '@/models/wallet';
import { balancesApi, transferFactory } from '@/shared/api';
import { getGiftInfo, toFormattedBalance } from '@/shared/helpers';
import { type Asset } from '@/types/substrate';
import { BigTitle, Icon, LottiePlayer, Shimmering } from '@/ui/atoms';

type GiftStatus = 'claimed' | 'notClaimed';

const PAUSE_DURATION = 3015;

const GIFTS: Record<GiftStatus, { text: string; btnText: string }> = {
  claimed: { text: 'Gift was claimed', btnText: 'Okay' },
  notClaimed: { text: 'Claim your gift', btnText: 'Claim' },
};

let timeoutId: ReturnType<typeof setTimeout>;

export const GiftClaim = () => {
  const { isGiftClaimed, setIsGiftClaimed } = useGlobalContext();

  const wallet = useUnit(walletModel.$wallet);
  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);
  const webApp = useUnit(telegramModel.$webApp);
  const startParam = useUnit(telegramModel.$startParam);

  const [giftBalance, setGiftBalance] = useState<BN | null>(null);
  const [giftAsset, setGiftAsset] = useState<Asset | null>(null);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftStatus, setGiftStatus] = useState<GiftStatus | null>(null);

  const [lottie, setLottie] = useState<AnimationItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (isGiftClaimed || !startParam || !wallet?.publicKey) return;
    setIsOpen(true);

    const giftInfo = getGiftInfo(Object.values(chains), wallet.publicKey, startParam);
    if (!giftInfo) return;

    const { chainId, asset, giftAddress, symbol } = giftInfo;
    if (connections[chainId].status !== 'connected') {
      // Repetitive connections will be filtered out in network-model
      networkModel.input.assetConnected({ chainId, assetId: asset.assetId });

      return;
    }

    getGiftBalance(connections[chainId].api!, giftAddress, asset).then(balance => {
      setGiftStatus(balance.isZero() ? 'claimed' : 'notClaimed');
      setGiftSymbol(balance.isZero() ? '' : symbol);
      setGiftBalance(balance);
      setGiftAsset(asset);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [startParam, wallet, isGiftClaimed, connections]);

  const getGiftBalance = async (api: ApiPromise, giftAddress: Address, asset: Asset): Promise<BN> => {
    const giftBalance = await balancesApi.getFreeBalance(api, giftAddress, asset);
    if (giftBalance.isZero()) return BN_ZERO;

    const fee = await transferFactory.createService(api, asset).getTransferFee({ transferAll: true });
    const rawBalance = giftBalance.sub(fee);

    return rawBalance.isNeg() ? BN_ZERO : rawBalance;
  };

  const handleClose = () => {
    clearTimeout(timeoutId);
    setIsOpen(false);

    if (giftBalance) {
      setIsGiftClaimed(true);
    }
  };

  const handleGiftClaim = () => {
    const giftInfo = getGiftInfo(Object.values(chains), wallet!.publicKey!, startParam!);
    if (!giftInfo) return;

    setIsDisabled(true);
    if (!giftBalance || giftBalance.isZero()) {
      handleClose();

      return;
    }
    clearTimeout(timeoutId);

    if (lottie) {
      lottie.play();
    }

    transferFactory
      .createService(connections[giftInfo.chainId].api!, giftInfo.asset)
      .sendTransfer({
        keyringPair: giftInfo.keyring,
        amount: giftBalance,
        destination: giftInfo.address,
        transferAll: true,
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
        {giftStatus && (
          <>
            <ModalHeader className="text-center">
              <BigTitle> {GIFTS[giftStatus].text}</BigTitle>
            </ModalHeader>
            <ModalBody>
              {giftStatus === 'notClaimed' ? (
                <LottiePlayer
                  autoplay
                  loop={false}
                  className="m-auto h-[248px] w-[248px]"
                  sources={[`/assets/lottie/${giftSymbol}_unpack.json`, '/assets/lottie/Default_unpack.json']}
                  lottieRef={setLottie}
                  onEvent={handlePlayerEvent}
                />
              ) : (
                <Icon name="GiftClaimed" className="m-auto h-[248px] w-[248px]" />
              )}
            </ModalBody>
            <ModalFooter className="justify-center">
              <Button
                color="primary"
                className="h-[50px] w-full rounded-full"
                isDisabled={isDisabled}
                isLoading={!giftBalance}
                onPress={handleGiftClaim}
              >
                {GIFTS[giftStatus].btnText}{' '}
                {giftStatus === 'notClaimed' &&
                  giftBalance &&
                  `${toFormattedBalance(giftBalance, giftAsset?.precision).value} ${giftSymbol}`}
              </Button>
            </ModalFooter>
          </>
        )}

        {!giftStatus && (
          <>
            <ModalHeader className="text-center">
              <Shimmering width={200} height={30} className="rounded-full" />
            </ModalHeader>
            <ModalBody>
              <Icon name="PendingGift" className="m-auto h-[170px] w-[170px]" />
            </ModalBody>
            <ModalFooter className="justify-center">
              <Shimmering height={50} width={300} className="w-full rounded-full" />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
