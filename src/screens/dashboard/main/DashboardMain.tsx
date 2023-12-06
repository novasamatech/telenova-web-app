'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { encodeAddress } from '@polkadot/util-crypto';
import { Avatar } from '@nextui-org/react';

import { resetWallet } from '@common/wallet';
import { useBalances } from '@common/balances/BalanceProvider';
import { useChainRegistry } from '@common/chainRegistry';
import { ChainAssetAccount } from '@common/types';
import { IAssetBalance } from '@common/balances/types';
import { polkadot } from '@common/chainRegistry/knownChains';
import { useExtrinsicProvider } from '@common/extrinsicService/ExtrinsicProvider';
import { Paths } from '@/common/routing';
import { useGlobalContext } from '@/common/providers/contextProvider';
import { useTelegram } from '@/common/providers/telegramProvider';
import { BodyText, CaptionText, Icon, AssetsList, Plate, Price } from '@/components';

// temp mock
const mockAssets = [
  {
    name: 'polkadot',
    symbol: 'DOT',
    balance: '0',
    assetId: 123,
    precision: 10,
  },
  {
    name: 'kusama',
    symbol: 'KSM',
    balance: '0',
    assetId: 234,
    precision: 5,
  },
  {
    name: 'westend',
    symbol: 'WND',
    balance: '0',
    assetId: 345,
    precision: 10,
  },
];

export const DashboardMain = () => {
  const router = useRouter();
  const { getAllChains } = useChainRegistry();
  const { subscribeBalance } = useBalances();
  const extrinsicService = useExtrinsicProvider();
  const { publicKey } = useGlobalContext();
  const { user, MainButton } = useTelegram();

  useEffect(() => {
    MainButton?.hide();
    console.log(publicKey);

    if (!publicKey) {
      return;
    }
    (async () => {
      const chains = await getAllChains();
      console.info(`All chains ${chains}`);

      for (const chain of chains) {
        const account: ChainAssetAccount = {
          chainId: chain.chainId,
          assetId: chain.assets[0].assetId,
          publicKey: publicKey,
        };

        const address = encodeAddress(publicKey, chain.addressPrefix);
        console.log(publicKey, account, address);
        subscribeBalance(account, (balance: IAssetBalance) => {
          console.log(`Balance ${address} => ${balance.total().toString()}`);
        });
      }
    })();
  }, []);

  function clearWallet() {
    resetWallet();
    router.replace(Paths.ONBOARDING);
  }

  async function handleSign() {
    extrinsicService
      .submitExtrinsic(polkadot.chainId, (builder) => builder.addCall(builder.api.tx.system.remark('Hello')))
      .then(
        (hash) => {
          alert('Success: ' + hash);
        },
        (failure) => {
          alert('Failed: ' + failure);
        },
      );
  }

  async function handleFee() {
    extrinsicService
      .estimateFee(polkadot.chainId, (builder) =>
        builder.addCall(
          builder.api.tx.balances.transferKeepAlive(
            '0xcc23ed33549e874ae7c7653fc5d95b3242dc7df5742664b4809e337a13126433',
            '1234',
          ),
        ),
      )
      .then(
        (fee) => {
          alert('Fee: ' + fee);
        },
        (failure) => {
          alert('Failed to calculate fee: ' + failure);
        },
      );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 mb-6">
        <Avatar src={user?.photo_url} className="w-10 h-10" name={user?.first_name[0]} />
        <CaptionText className="self-center">Good morning, {user?.first_name || 'friend'}</CaptionText>
        <Icon name="settings" size={40} />
      </div>
      <Plate className="p-4 flex flex-col items-center mb-2">
        <BodyText className="text-text-hint">Total balance</BodyText>
        <Price amount="0" />
        <div className="grid grid-cols-3 w-full justify-items-center mt-4">
          <Icon name="send" size={50} text="Send" />
          <Icon name="receive" size={50} text="Receive" />
          <Icon name="buy" size={50} text="Buy" />
        </div>
      </Plate>
      <Plate className="p-4 flex flex-col mb-2">
        <CaptionText>Assets</CaptionText>
        <AssetsList assets={mockAssets} />
      </Plate>

      <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
        Reset Wallet
      </button>
      {/* <button className="btn btn-blue mt-4" onClick={handleSign}>
        Sign
      </button>
      <button className="btn btn-blue mt-4" onClick={handleFee}>
        Calculate Fee
      </button> */}
    </div>
  );
};
