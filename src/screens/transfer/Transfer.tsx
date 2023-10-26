'use client';
import {useState, useEffect} from 'react'
import {getWallet, Wallet} from "@common/wallet";

export function TransferPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);

    useEffect(() => {
        const wallet = getWallet();
        setWallet(wallet);
    }, [setWallet])

    return (
        <div className="h-screen flex flex-col justify-center items-center">
            <input/>
        </div>
    );
}