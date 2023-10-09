'use client';
import '@app/globals.css'
import { useRouter } from 'next/navigation'

export default function OnboardingStartPage() {
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <button className="btn btn-blue mt-4" onClick={() => router.push('/onboarding/create-wallet')}>
          Create Wallet
      </button>
      <button className="btn btn-blue mt-4" onClick={() => router.push('/onboarding/import-wallet')}>
          Import Wallet
      </button>
    </div>
  );
}