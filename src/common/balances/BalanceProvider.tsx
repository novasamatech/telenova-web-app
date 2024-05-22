import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { encodeAddress } from '@polkadot/util-crypto';
import { useChainRegistry } from '@common/chainRegistry';
import { IAssetBalance } from '@common/balances/types';
import { ChainAssetAccount, ChainId, Gift, PersistentGift, GiftStatus, Address } from '@common/types';
import { useNumId } from '@common/utils/NumId';
import { SubscriptionState } from '@common/subscription/types';
import { createBalanceService } from '@common/balances/BalanceService';
import { chainAssetAccountIdToString } from '../utils/balance';
import { ASSET_STATEMINE } from '../utils/constants';

type StateStore = Record<string, SubscriptionState<IAssetBalance>>;
type UpdateCallback = (balance: IAssetBalance) => void;
type UpdaterCallbackStore = Record<number, UpdateCallback>;

type BalanceProviderContextProps = {
  subscribeBalance: (account: ChainAssetAccount, onUpdate: UpdateCallback) => number;
  unsubscribeBalance: (unsubscribeId: number) => void;
  getGiftsState: (mapGifts: Map<ChainId, PersistentGift[]>) => Promise<[Gift[], Gift[]]>;
  getFreeBalance: (address: Address, chainId: ChainId) => Promise<string>;
  getFreeBalanceStatemine: (address: Address, chainId: ChainId, assetId: string) => Promise<string>;
};

const BalanceProviderContext = createContext<BalanceProviderContextProps>({} as BalanceProviderContextProps);

export const BalanceProvider = ({ children }: PropsWithChildren) => {
  const { nextId } = useNumId();
  const { getConnection, getChain, getAssetByChainId } = useChainRegistry();
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

  //TODO delete it after PR for asset hub is merged
  const USDT_LEFTOVER = 80000;
  async function getGiftsState(mapGifts: Map<ChainId, PersistentGift[]>): Promise<[Gift[], Gift[]]> {
    const unclaimed = [] as Gift[];
    const claimed = [] as Gift[];

    await Promise.all(
      Array.from(mapGifts).map(async ([chainId, accounts]) => {
        const connection = await getConnection(chainId);
        const chain = await getChain(chainId);
        // To have a backward compatibility with old gifts
        const asset = accounts[0].assetId ? getAssetByChainId(accounts[0].assetId, chainId) : chain?.assets[0];

        if (asset?.type === ASSET_STATEMINE) {
          const balances = await connection.api.query.assets.account.multi(
            accounts.map((i) => [asset.typeExtras?.assetId, i.address]),
          );

          balances.forEach((balance, idx) => {
            balance.isNone || Number(balance.unwrap().balance) <= USDT_LEFTOVER
              ? claimed.push({
                  ...accounts[idx],
                  chainAsset: asset,
                  status: GiftStatus.CLAIMED,
                })
              : unclaimed.push({ ...accounts[idx], chainAsset: asset, status: GiftStatus.UNCLAIMED });
          });
        } else {
          const balances = await connection.api.query.system.account.multi(accounts.map((i) => i.address));

          balances.forEach((d, idx) =>
            d.data.free.isEmpty
              ? claimed.push({
                  ...accounts[idx],
                  chainAsset: asset,
                  status: GiftStatus.CLAIMED,
                })
              : unclaimed.push({ ...accounts[idx], chainAsset: asset, status: GiftStatus.UNCLAIMED }),
          );
        }
      }),
    );

    return [unclaimed.sort((a, b) => b.timestamp - a.timestamp), claimed.sort((a, b) => b.timestamp - a.timestamp)];
  }
  async function getFreeBalance(address: Address, chainId: ChainId): Promise<string> {
    const connection = await getConnection(chainId);
    const balance = await connection.api.query.system.account(address);

    return balance.data.free.toString();
  }

  async function getFreeBalanceStatemine(address: Address, chainId: ChainId, assetId: string): Promise<string> {
    const connection = await getConnection(chainId);
    const balance = await connection.api.query.assets.account(assetId, address);

    return balance.isNone ? '0' : balance.unwrap().balance.toString();
  }

  return (
    <BalanceProviderContext.Provider
      value={{ subscribeBalance, unsubscribeBalance, getGiftsState, getFreeBalance, getFreeBalanceStatemine }}
    >
      {children}
    </BalanceProviderContext.Provider>
  );
};

export const useBalances = () => useContext<BalanceProviderContextProps>(BalanceProviderContext);
