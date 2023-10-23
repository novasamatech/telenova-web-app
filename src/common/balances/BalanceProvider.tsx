import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { useChainRegistry } from '@common/chainRegistry';
import {IAssetBalance} from "@common/balances/types";
import { ChainAssetAccountId, chainAssetAccountIdToString } from '@common/types';
import { useNumId } from '@common/utils/NumId';
import {SubscriptionState} from "@common/subscription/types";
import {createBalanceService} from "@common/balances/BalanceService";

type StateStore = Record<string, SubscriptionState<IAssetBalance>>;
type UpdateCallback = (balance: IAssetBalance) => void;
type UpdaterCallbackStore = Record<number, UpdateCallback>

type BalanceProviderContextProps = {
	subscribeBalance: (account: ChainAssetAccountId, onUpdate: UpdateCallback) => number;
	unsubscribeBalance: (unsubscribeId: number) => void;
}

const BalanceProviderContext = createContext<BalanceProviderContextProps>({} as BalanceProviderContextProps);

export const BalanceProvider = ({ children }: PropsWithChildren) => {
	const { nextId } = useNumId();
	const { getConnection } = useChainRegistry();
	const unsubscribeToAccount = useRef<Record<number, ChainAssetAccountId>>({});
	const accountToState = useRef<StateStore>({});

	const subscribeBalance = (account: ChainAssetAccountId, onUpdate: (balance: IAssetBalance) => void): number => {
		const  unsubscribeId = nextId();
		const key = chainAssetAccountIdToString(account);
		let currentState = accountToState.current[key];

		if (!currentState) {
			registerNewSubscription(account, onUpdate, unsubscribeId);
		} else {
			const currentBalance = currentState.current;

			currentState.updaters[unsubscribeId] = onUpdate;
			accountToState.current[key] = currentState

			unsubscribeToAccount.current[unsubscribeId] = account;

			if (currentBalance) {
				onUpdate(currentBalance);
			}
		}

		return unsubscribeId;
	}

	const unsubscribeBalance = (unsubscribeId: number) => {
		const account = unsubscribeToAccount.current[unsubscribeId];
		delete unsubscribeToAccount.current[unsubscribeId];

		if (!account) {
			return;
		}

		const stateKey = chainAssetAccountIdToString(account);
		let state = accountToState.current[stateKey];
		delete state.updaters[unsubscribeId];
		accountToState.current[stateKey] = state;
	};

	function setupSubscriptionState(
		account: ChainAssetAccountId,
		unsubscribeId: number,
		onUpdate: (balance: IAssetBalance) => void
	) {
		let updaters: UpdaterCallbackStore = {};
		updaters[unsubscribeId] = onUpdate;

		const state: SubscriptionState<IAssetBalance> = {
			current: undefined,
			updaters: updaters,
			unsubscribe: undefined
		}

		const stateKey = chainAssetAccountIdToString(account);
		accountToState.current[stateKey] = state;
	}

	async function registerNewSubscription(
		account: ChainAssetAccountId,
		onUpdate: (balance: IAssetBalance) => void,
		unsubscribeId: number
	): Promise<void> {
		const connection = await getConnection(account.chainId);

		unsubscribeToAccount.current[unsubscribeId] = account;

		const service = createBalanceService(connection);

		setupSubscriptionState(account, unsubscribeId, onUpdate);

		const unsubscribe = await service.subscribe(account.accountId, (balance: IAssetBalance) => {
			console.log(`New balance: ${balance.total().toString()}`);

			notifySubscribers(account, balance);
		});

		if (!setupUnsubscribeOnState(account, unsubscribe)) {
			console.warn(`Can't setup unsubscribe ${chainAssetAccountIdToString(account)}`);

			// looks like we have already unsubscribed
			unsubscribe();
		}
	}

	function setupUnsubscribeOnState(account: ChainAssetAccountId, unsubscribe: () => void): boolean {
		const stateKey = chainAssetAccountIdToString(account);
		let state = accountToState.current[stateKey];

		if (state && !state.unsubscribe) {
			state.unsubscribe = unsubscribe;
			accountToState.current[stateKey] = state;

			return true;
		} else {
			return false;
		}
	}

	function notifySubscribers(account: ChainAssetAccountId, balance: IAssetBalance) {
		const stateKey = chainAssetAccountIdToString(account);
		const state = accountToState.current[stateKey];

		if (state) {
			Object.values(state.updaters).forEach((callback) => {
				callback(balance);
			});
		}
	}

	return (
    	<BalanceProviderContext.Provider value={{ subscribeBalance, unsubscribeBalance }}>
      		{children}
    	</BalanceProviderContext.Provider>
  	);
};

export const useBalances = () => useContext<BalanceProviderContextProps>(BalanceProviderContext);