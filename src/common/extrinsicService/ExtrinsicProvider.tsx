import {createContext, PropsWithChildren, useContext, useState} from "react";
import {ChainId} from "@common/types";
import {ExtrinsicBuilding, ExtrinsicBuildingOptions} from "@common/extrinsicService/types";
import {Balance} from "@polkadot/types/interfaces";
import {SubmittableResultResult} from "@polkadot/api-base/types/submittable";
import {useExtrinsicService} from "@common/extrinsicService/ExtrinsicService";
import {ApiTypes} from "@polkadot/api-base/types/base";
import {KeyringPair} from "@polkadot/keyring/types";
import {PasswordPage} from "@app/password/Password";

type ExtrinsicProviderContextProps = {
    estimateFee: (
        chainId: ChainId,
        building: ExtrinsicBuilding,
        options?: Partial<ExtrinsicBuildingOptions>
    ) => Promise<Balance>;

    submitExtrinsic: <ApiType extends ApiTypes> (
        chainId: ChainId,
        building: ExtrinsicBuilding,
        options?: Partial<ExtrinsicBuildingOptions>
    ) => SubmittableResultResult<'promise'>
}

type ProviderStateAuth = {
    kind: 'auth',
    resolve: (keyringPair: KeyringPair) => void
    reject: () => void
}

type ProviderStateContent = {
    kind: 'content'
}

function ProviderStateContent(): ProviderStateContent {
    return {kind: "content"}
}

function ProviderStateAuth(resolve: (keyringPair: KeyringPair) => void, reject: () => void): ProviderStateAuth {
    return {kind: "auth", resolve, reject}
}

type ProviderState = ProviderStateAuth | ProviderStateContent

const ExtrinsicProviderContext = createContext<ExtrinsicProviderContextProps>({} as ExtrinsicProviderContextProps);

export const FAKE_ACCOUNT_ID = "0x" + "1".repeat(64);

export const ExtrinsicProvider = ({children}: PropsWithChildren) => {
    const {prepareExtrinsic} = useExtrinsicService();

    const [extrinsicState, setExtrinsicState] = useState<ProviderState>(ProviderStateContent())

    async function estimateFee(
        chainId: ChainId,
        building: ExtrinsicBuilding,
        options?: Partial<ExtrinsicBuildingOptions>
    ): Promise<Balance> {
        const extrinsic = await prepareExtrinsic<'promise'>(chainId, building, options)
        const paymentInfo = await extrinsic.paymentInfo(FAKE_ACCOUNT_ID);

        return paymentInfo.partialFee
    }

    function submitExtrinsic(
        chainId: ChainId,
        building: ExtrinsicBuilding,
        options?: Partial<ExtrinsicBuildingOptions>
    ): SubmittableResultResult<`promise`> {
        const extrinsicPromise = prepareExtrinsic<'promise'>(chainId, building, options)

        const keyringPromise = new Promise<KeyringPair>(function (resolve, reject) {
            const providerState = ProviderStateAuth(resolve, reject)
            setExtrinsicState(providerState)
        })

        return extrinsicPromise.then(async extrinsic => {
            const keyringPair = await keyringPromise;
            await extrinsic.signAsync(keyringPair);
            keyringPair.lock();
            return await extrinsic.send();
        }).finally(() => {
            setExtrinsicState(ProviderStateContent())
        });
    }

    let content;
    switch (extrinsicState.kind) {
        case "content":
            content = children
            break;
        case "auth":
            content = <PasswordPage onResolve={extrinsicState.resolve} onReject={extrinsicState.reject}/>
    }

    return (
        <ExtrinsicProviderContext.Provider value={{estimateFee, submitExtrinsic}}>
            {content}
        </ExtrinsicProviderContext.Provider>
    );
};

export const useExtrinsicProvider = () => useContext<ExtrinsicProviderContextProps>(ExtrinsicProviderContext);