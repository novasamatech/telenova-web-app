'use client';
import '@app/globals.css'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import secureLocalStorage  from  "react-secure-storage";

export default function TransferPage() {
  const [mnemonic, setMnemonic] = useState<string>("")

  useEffect(() => {
    const mnemonic = secureLocalStorage.getItem("wallet")

    if (typeof mnemonic === 'string') {
        setMnemonic(mnemonic as string)
    }
  }, [setMnemonic])

  const router = useRouter()

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <label>{mnemonic}</label>
      <button className="btn btn-blue mt-4" onClick={() => router.push('/onboarding/create-wallet')}>
          Create Wallet
      </button>
      <button className="btn btn-blue mt-4" onClick={() => router.push('/onboarding/import-wallet')}>
          Import Wallet
      </button>
    </div>
  );
}