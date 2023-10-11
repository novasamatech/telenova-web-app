'use client';
import { useState, useEffect } from 'react'
import { Wallet, getWallet, resetWallet } from '@common/wallet'
import { useNavigate } from 'react-router-dom';
import { Paths } from '@common/routing'

export function DashboardMainPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    const wallet = getWallet()
    setWallet(wallet)
  }, [setWallet])

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