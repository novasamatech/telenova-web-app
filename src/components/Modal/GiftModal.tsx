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
import { formatAmount, formatBalance } from '@/common/utils/balance';
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

export default function GiftModal() {
  const { publicKey, isGiftClaimed, setAssets, setIsGiftClaimed } = useGlobalContext();
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
    const fee = await handleFeeTrasferAll(estimateFee, chain.chain.chainId);
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
  }, [startParam, publicKey, isGiftClaimed]);

  const handleClose = () => {
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
      .then(() => {
        setAssets((assets) =>
          assets.map((asset) => {
            if (asset.chainId === chain.chain.chainId) {
              const balance = +formatAmount(giftBalance, chain.asset.precision);

              return { ...asset, totalBalance: (Number(asset?.totalBalance || 0) + balance).toString() };
            }

            return asset;
          }),
        );
      })
      .catch(() => {
        webApp?.showAlert('Something went wrong. Failed to claim gift');
      })
      .finally(() => {
        handleClose();
      });
  };

  // TODO: add pause gift
  // opt:  lib to change balance - animate

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="xs"
        placement="center"
        isDismissable={false}
        classNames={{
          header: 'p-3',
          footer: 'p-3',
          closeButton: 'mt-[10px]',
        }}
        onClose={handleClose}
      >
        <ModalContent>
          <ModalHeader className="text-center">
            <BigTitle> {GIFTS[giftStatus || GIFT_STATUS.NOT_CLAIMED].text}</BigTitle>
          </ModalHeader>
          {giftStatus !== null ? (
            <>
              <ModalBody>
                {giftStatus === GIFT_STATUS.NOT_CLAIMED ? (
                  <Lottie
                    path={`/gifs/Gift_claim_${giftSymbol}.json`}
                    className="player w-[210px] h-[170px] m-auto"
                    ref={lottieRef}
                    loop={false}
                  />
                ) : (
                  <Icon name="GiftClaimed" className="w-[210px] h-[220px] m-auto" />
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
            <div className="w-full grid gap-4 justify-center mb-4">
              <Icon name="PendingGift" className="w-[210px] h-[190px] m-auto" />
              <Shimmering width={220} height={40} />
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
