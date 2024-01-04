import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { useChainRegistry } from '@common/chainRegistry';
import { IAssetBalance } from '@common/balances/types';
import { chainAssetAccountIdToString, ChainAssetAccount, ChainId, Gift } from '@common/types';
import { useNumId } from '@common/utils/NumId';
import { SubscriptionState } from '@common/subscription/types';
import { createBalanceService } from '@common/balances/BalanceService';
import { encodeAddress } from '@polkadot/util-crypto';

type StateStore = Record<string, SubscriptionState<IAssetBalance>>;
type UpdateCallback = (balance: IAssetBalance) => void;
type UpdaterCallbackStore = Record<number, UpdateCallback>;

type BalanceProviderContextProps = {
  subscribeBalance: (account: ChainAssetAccount, onUpdate: UpdateCallback) => number;
  unsubscribeBalance: (unsubscribeId: number) => void;
  getGiftsBalance: (accounts: Gift[], chainId: ChainId) => Promise<[Gift[], Gift[]]>;
};

const BalanceProviderContext = createContext<BalanceProviderContextProps>({} as BalanceProviderContextProps);

export const BalanceProvider = ({ children }: PropsWithChildren) => {
  const { nextId } = useNumId();
  const { getConnection, getChain } = useChainRegistry();
  const unsubscribeToAccount = useRef<Record<number, ChainAssetAccount>>({});
  const accountToState = useRef<StateStore>({});

  const subscribeBalance = (account: ChainAssetAccount, onUpdate: (balance: IAssetBalance) => void): number => {
    const unsubscribeId = nextId();
    const key = chainAssetAccountIdToString(account);
    const currentState = accountToState.current[key];

    if (!currentState) {
      registerNewSubscription(account, onUpdate, unsubscribeId);
    } else {
      const currentBalance = currentState.current;

      currentState.updaters[unsubscribeId] = onUpdate;
      accountToState.current[key] = currentState;

      unsubscribeToAccount.current[unsubscribeId] = account;

      if (currentBalance) {
        onUpdate(currentBalance);
      }
    }

    return unsubscribeId;
  };

  const unsubscribeBalance = (unsubscribeId: number) => {
    const account = unsubscribeToAccount.current[unsubscribeId];
    delete unsubscribeToAccount.current[unsubscribeId];

    if (!account) {
      return;
    }

    const stateKey = chainAssetAccountIdToString(account);
    const state = accountToState.current[stateKey];
    delete state.updaters[unsubscribeId];
    accountToState.current[stateKey] = state;
  };

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
    const chain = await getChain(account.chainId);

    if (!chain) {
      throw `No chain found ${account.chainId}`;
    }

    const address = encodeAddress(account.publicKey, chain.addressPrefix);

    const connection = await getConnection(account.chainId);

    unsubscribeToAccount.current[unsubscribeId] = account;

    const service = createBalanceService(connection);

    setupSubscriptionState(account, unsubscribeId, onUpdate);

    const unsubscribe = await service.subscribe(address, (balance: IAssetBalance) => {
      console.log(`New balance: ${balance.total().toString()}`);

      updateBalance(account, balance);
      notifySubscribers(account, balance);
    });

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
    } else {
      return false;
    }
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
      Object.values(state.updaters).forEach((callback) => {
        callback(balance);
      });
    }
  }

  async function getGiftsBalance(accounts: Gift[], chainId: ChainId): Promise<[Gift[], Gift[]]> {
    const connection = await getConnection(chainId);
    const balances = await connection.api.query.system.account.multi(accounts.map((i) => i.address));
    const chain = await getChain(chainId);

    const unclaimed = [] as Gift[];
    const claimed = [] as Gift[];

    balances.forEach((d, idx) =>
      d.data.free.isEmpty
        ? claimed.push({
            ...accounts[idx],
            chainAsset: chain?.assets[0],
            status: 'Claimed',
          })
        : unclaimed.push({ ...accounts[idx], chainAsset: chain?.assets[0], status: 'Unclaimed' }),
    );

    return [unclaimed, claimed];
  }

  return (
    <BalanceProviderContext.Provider value={{ subscribeBalance, unsubscribeBalance, getGiftsBalance }}>
      {children}
    </BalanceProviderContext.Provider>
  );
};

export const useBalances = () => useContext<BalanceProviderContextProps>(BalanceProviderContext);
