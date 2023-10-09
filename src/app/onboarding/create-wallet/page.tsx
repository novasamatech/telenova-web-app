'use client';
import '@app/globals.css'

import { createTestWallet, generateWalletMnemonic } from '@common/wallet';
import { getTelegram } from '@common/telegram';

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CreateWalletPage() {
  const router = useRouter()

  function confirmCreation(mnemonic: string) {
      const telegram = getTelegram();

      if (telegram) {
        // TODO: Need to request pin before creating wallet
        const wallet = createTestWallet(mnemonic)

        if (wallet) {
          telegram.completeOnboarding(wallet.publicKey)
        } else {
          console.error("Can't create wallet");
        }
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