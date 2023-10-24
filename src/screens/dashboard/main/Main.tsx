'use client';
import { useState, useEffect } from 'react'
import { Wallet, getWallet, resetWallet } from '@common/wallet'
import { useNavigate } from 'react-router-dom';
import { Paths } from '@common/routing'
import {useChainRegistry} from '@common/chainRegistry';
import {useBalances } from "@common/balances/BalanceProvider";
import {ChainAssetAccount} from "@common/types";
import {IAssetBalance} from "@common/balances/types";
import {encodeAddress} from "@polkadot/util-crypto";
import {polkadot} from "@common/chainRegistry/knownChains";
import {useExtrinsicProvider} from "@common/extrinsicService/ExtrinsicProvider";

export function DashboardMainPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const navigate = useNavigate();
  const { isRegistryReady, getAllChains, getConnection } = useChainRegistry();
  const { subscribeBalance } = useBalances();
  const extrinsicService = useExtrinsicProvider();

  useEffect(() => {
    const wallet = getWallet()
    setWallet(wallet)
  }, [setWallet])

  useEffect(() => {
      if(!isRegistryReady || !wallet) {
          return;
      }

    (async () => {
      const chains = await getAllChains();
      console.info(`All chains ${chains}`);

      for (const chain of chains) {
          const account: ChainAssetAccount = {
              chainId: chain.chainId,
              assetId: chain.assets[0].assetId,
              publicKey: wallet.publicKey
          }

          const address = encodeAddress(wallet.publicKey, chain.addressPrefix);
          subscribeBalance(account, (balance: IAssetBalance) => {
              console.log(`Balance ${address} => ${balance.total().toString()}`);
          });
      }
    })();
  }, [isRegistryReady, wallet]);

  function clearWallet() {
    resetWallet();
    navigate(Paths.ONBOARDING, {replace: true});
  }

  async function handleSign() {
    extrinsicService.submitExtrinsic(polkadot.chainId, (builder) =>
      builder.addCall(builder.api.tx.system.remark("Hello"))
    ).then(
      hash => {
        alert("Success: " + hash)
      },
      failure => {
        alert("Failed: " + failure)
      }
    )
  }

  async function handleFee() {
    extrinsicService.estimateFee(polkadot.chainId, (builder) =>
      builder.addCall(builder.api.tx.system.remark("Hello"))
    ).then(
      fee => {
        alert("Fee: " + fee)
      },
      failure => {
        alert("Failed to calculate fee: " + failure)
      }
    )
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{wallet ? wallet.publicKey : ""}</label>
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