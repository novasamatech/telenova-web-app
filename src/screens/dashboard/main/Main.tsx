'use client';
import {useState, useEffect} from 'react'
import {Wallet, getWallet, resetWallet} from '@common/wallet'
import {useNavigate} from 'react-router-dom';
import {Paths} from '@common/routing'
import {useChainRegistry} from '@common/chainRegistry';
import {polkadot} from "@common/chainRegistry/knownChains";
import {useExtrinsicProvider} from "@common/extrinsicService/ExtrinsicProvider";

export function DashboardMainPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const navigate = useNavigate();
    const {getAllChains, getConnection} = useChainRegistry();
    const extrinsicService = useExtrinsicProvider()


    useEffect(() => {
        const wallet = getWallet()
        setWallet(wallet)
    }, [setWallet])

    useEffect(() => {
        (async () => {
            const chains = await getAllChains();
            console.info(`All chains ${chains}`);

            for (const chain of chains) {
                const connection = getConnection(chain.chainId);
                console.log(`Connection ${connection}`);
            }
        })();
    }, [getConnection]);

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

    return (
        <div className="h-screen flex flex-col justify-center items-center">
            <label>{wallet ? wallet.publicKey : ""}</label>
            <button className="btn btn-blue mt-4" onClick={() => clearWallet()}>
                Reset Wallet
            </button>
            <button className="btn btn-blue mt-4" onClick={handleSign}>
                Sign
            </button>
        </div>
    );
}