'use client';
import '@app/globals.css'

import { createTestWallet, generateWalletMnemonic } from '@common/wallet';

import { useRouter } from 'next/navigation'

export default function CreateWalletPage() {
  const router = useRouter()

  function confirmCreation(mnemonic: string) {
      const wallet = createTestWallet(mnemonic)

      if (wallet) {
        router.replace('/dashboard/main')
      }
  }

  const newMnemonic = generateWalletMnemonic()

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{newMnemonic}</label>
      <button className="btn btn-blue mt-4" onClick={() => confirmCreation(newMnemonic)}>
          Confirm
      </button>
    </div>
  );
}