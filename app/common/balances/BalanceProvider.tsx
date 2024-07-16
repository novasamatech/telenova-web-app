import { type PropsWithChildren, createContext, useCallback, useContext, useRef } from 'react';

import { useUnit } from 'effector-react';

import { encodeAddress } from '@polkadot/util-crypto';

import { networkModel } from '@/common/network/network-model';
import { type ChainAssetAccount } from '@/common/types';
import { chainAssetAccountIdToString } from '@/common/utils';
import { useNumId } from '@/common/utils/hooks/useNumId';

import { createBalanceService } from './BalanceService';
import { type IAssetBalance, type SubscriptionState } from './types';

type StateStore = Record<string, SubscriptionState<IAssetBalance>>;
type UpdateCallback = (balance: IAssetBalance) => void;
type UpdaterCallbackStore = Record<number, UpdateCallback>;

type BalanceProviderContextProps = {
  subscribeBalance: (account: ChainAssetAccount, onUpdate: UpdateCallback) => number;
  unsubscribeBalance: (unsubscribeId: number) => void;
};

const BalanceProviderContext = createContext<BalanceProviderContextProps>({} as BalanceProviderContextProps);

export const BalanceProvider = ({ children }: PropsWithChildren) => {
  const { nextId } = useNumId();
  const chains = useUnit(networkModel.$chains);
  const connections = useUnit(networkModel.$connections);

  const unsubscribeToAccount = useRef<Record<number, ChainAssetAccount>>({});
  const accountToState = useRef<StateStore>({});

  const subscribeBalance = (account: ChainAssetAccount, onUpdate: (balance: IAssetBalance) => void): number => {
    const unsubscribeId = nextId();
    const key = chainAssetAccountIdToString(account);
    const currentState = accountToState.current[key];

    if (currentState?.current) {
      const currentBalance = currentState.current;

      currentState.updaters[unsubscribeId] = onUpdate;
      accountToState.current[key] = currentState;

      unsubscribeToAccount.current[unsubscribeId] = account;

      if (currentBalance) {
        onUpdate(currentBalance);
      }
    } else {
      registerNewSubscription(account, onUpdate, unsubscribeId).catch(error => console.error(error));
    }

    return unsubscribeId;
  };

  const unsubscribeBalance = useCallback((unsubscribeId: number) => {
    const account = unsubscribeToAccount.current[unsubscribeId];
    delete unsubscribeToAccount.current[unsubscribeId];

    if (!account) return;

    const stateKey = chainAssetAccountIdToString(account);
    const state = accountToState.current[stateKey];
    delete state.updaters[unsubscribeId];
    accountToState.current[stateKey] = state;
  }, []);

  function setupSubscriptionState(
    account: ChainAssetAccount,
    unsubscribeId: number,
    onUpdate: (balance: IAssetBalance) => void,
  ) {
    const updaters: UpdaterCallbackStore = {};
    updaters[unsubscribeId] = onUpdate;

    const state: SubscriptionState<IAssetBalance> = {
      current: undefined,
      updaters: updaters,
      unsubscribe: undefined,
    };

    const stateKey = chainAssetAccountIdToString(account);
    accountToState.current[stateKey] = state;
  }

  async function registerNewSubscription(
    account: ChainAssetAccount,
    onUpdate: (balance: IAssetBalance) => void,
    unsubscribeId: number,
  ): Promise<void> {
    setupSubscriptionState(account, unsubscribeId, onUpdate);

    const chain = chains[account.chainId];
    const api = connections[account.chainId].api;

    if (!chain) {
      throw `No chain found ${account.chainId}`;
    }

    if (!api || !api.isConnected) {
      throw `No ApiPromise or it's not connected for ${account.chainId}`;
    }

    unsubscribeToAccount.current[unsubscribeId] = account;

    const address = encodeAddress(account.publicKey, chain.addressPrefix);
    const service = createBalanceService(api);

    const handleUpdate = (balance: IAssetBalance) => {
      console.log(`New balance: ${balance.total().toString()}`);

      updateBalance(account, balance);
      notifySubscribers(account, balance);
    };

    const unsubscribe =
      account.asset.type === 'statemine'
        ? await service.subscribeStatemineAssets(address, account.asset, handleUpdate)
        : await service.subscribe(address, handleUpdate);

    if (!setupUnsubscribeOnState(account, unsubscribe)) {
      // this should never happen but let's cleanup remote subscription anyway

      console.warn(`Can't setup unsubscribe ${chainAssetAccountIdToString(account)}`);
      unsubscribe();
    }
  }

  function setupUnsubscribeOnState(account: ChainAssetAccount, unsubscribe: () => void): boolean {
    const stateKey = chainAssetAccountIdToString(account);
    const state = accountToState.current[stateKey];

    if (state && !state.unsubscribe) {
      state.unsubscribe = unsubscribe;
      accountToState.current[stateKey] = state;

      return true;
    }

    return false;
  }

  function updateBalance(account: ChainAssetAccount, newBalance: IAssetBalance) {
    const stateKey = chainAssetAccountIdToString(account);
    const state = accountToState.current[stateKey];

    if (state) {
      state.current = newBalance;
      accountToState.current[stateKey] = state;
    } else {
      console.warn(`Can't update balance for state key ${stateKey}`);
    }
  }

  function notifySubscribers(account: ChainAssetAccount, balance: IAssetBalance) {
    const stateKey = chainAssetAccountIdToString(account);
    const state = accountToState.current[stateKey];

    if (state) {
      Object.values(state.updaters).forEach(callback => {
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
