'use client';
import '@app/globals.css'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Wallet, getWallet } from '@common/wallet'

export default function DashboardMainPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)

  const router = useRouter()

  useEffect(() => {
    const wallet = getWallet()
    setWallet(wallet)
  }, [setWallet])

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{wallet ? wallet.publicKey : ""}</label>
    </div>
  );
}