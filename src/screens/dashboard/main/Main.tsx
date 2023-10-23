'use client';
import { useState, useEffect } from 'react'
import { Wallet, getWallet, resetWallet } from '@common/wallet'
import { useNavigate } from 'react-router-dom';
import { Paths } from '@common/routing'
import { useChainRegistry } from '@common/chainRegistry';
import { useBalances } from "@common/balances/BalanceProvider";
import {ChainAssetAccountId} from "@common/types";
import {IAssetBalance} from "@common/balances/types";

export function DashboardMainPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const navigate = useNavigate();
  const { isRegistryReady, getAllChains, getConnection } = useChainRegistry();
  const { subscribeBalance } = useBalances();

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
              const account: ChainAssetAccountId = {
                  chainId: chain.chainId,
                  assetId: chain.assets[0].assetId,
                  accountId: wallet.publicKey
              }
              subscribeBalance(account, (balance: IAssetBalance) => {
                 console.log(`Balance ${chain.chainId} => ${balance.total().toString()}`);
              });
          }
      })();
  }, [isRegistryReady, wallet]);

  function clearWallet() {
      resetWallet();
      navigate(Paths.ONBOARDING, { replace: true});
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{wallet ? wallet.publicKey : ""}</label>
      <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
          Reset Wallet
      </button>
    </div>
  );
}