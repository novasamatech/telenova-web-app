'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { encodeAddress } from '@polkadot/util-crypto';
import { Wallet, getWallet, resetWallet } from '@common/wallet';
import { useChainRegistry } from '@common/chainRegistry';
import { useBalances } from '@common/balances/BalanceProvider';
import { ChainAssetAccount } from '@common/types';
import { IAssetBalance } from '@common/balances/types';
import { polkadot } from '@common/chainRegistry/knownChains';
import { useExtrinsicProvider } from '@common/extrinsicService/ExtrinsicProvider';
import { Paths } from '@/common/routing';

export function DashboardMain() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const { getAllChains } = useChainRegistry();
  const { subscribeBalance } = useBalances();
  const extrinsicService = useExtrinsicProvider();
  const router = useRouter();

  useEffect(() => {
    const wallet = getWallet();
    setWallet(wallet);
  }, [setWallet]);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    (async () => {
      const chains = await getAllChains();
      console.info(`All chains ${chains}`);

      for (const chain of chains) {
        const account: ChainAssetAccount = {
          chainId: chain.chainId,
          assetId: chain.assets[0].assetId,
          publicKey: wallet.publicKey,
        };

        const address = encodeAddress(wallet.publicKey, chain.addressPrefix);
        subscribeBalance(account, (balance: IAssetBalance) => {
          console.log(`Balance ${address} => ${balance.total().toString()}`);
        });
      }
    })();
  }, [wallet]);

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
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{wallet ? wallet.publicKey : ''}</label>
      <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
        Reset Wallet
      </button>
      <button className="btn btn-blue mt-4" onClick={handleSign}>
        Sign
      </button>
      <button className="btn btn-blue mt-4" onClick={handleFee}>
        Calculate Fee
      </button>
    </div>
  );
}
