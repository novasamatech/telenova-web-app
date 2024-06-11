import { BN } from '@polkadot/util';

import { Asset, Connection } from '@common/chainRegistry/types';
import { Address } from '@common/types';
import { IAssetBalance } from './types';

export interface IBalanceService {
  subscribe: (address: Address, onUpdate: (result: IAssetBalance) => void) => Promise<() => void>;
  subscribeStatemineAssets: (
    address: Address,
    asset: Asset,
    onUpdate: (result: IAssetBalance) => void,
  ) => Promise<() => void>;
}

export const createBalanceService = (connection: Connection): IBalanceService => {
  async function subscribe(address: Address, onUpdate: (result: IAssetBalance) => void): Promise<() => void> {
    return connection.api.query.system.account.multi([address], (accountInfoList: any[]) => {
      let frozen: BN;

      const data = accountInfoList[0].data;
      if (data.miscFrozen || data.feeFrozen) {
        const miscFrozen = new BN(data.miscFrozen);
        const feeFrozen = new BN(data.feeFrozen);
        frozen = miscFrozen.gt(feeFrozen) ? miscFrozen : feeFrozen;
      } else {
        frozen = new BN(data.frozen);
      }

      const free = new BN(data.free);
      const reserved = new BN(data.reserved);
      const total = free.add(reserved);
      const transferable = free.gt(frozen) ? free.sub(frozen) : new BN(0);

      const totalString = total.toString();
      const transferableString = transferable.toString();

      const assetBalance: IAssetBalance = {
        total: () => {
          return totalString;
        },
        transferable: () => {
          return transferableString;
        },
      };

      onUpdate(assetBalance);
    });
  }

  function subscribeStatemineAssets(
    address: Address,
    asset: Asset,
    onUpdate: (result: IAssetBalance) => void,
  ): Promise<() => void> {
    return connection.api.query.assets.account.multi([[asset.typeExtras?.assetId, address]], (data) => {
      const balance = data[0].isNone ? '0' : data[0].unwrap().balance.toString();

      // No frozen and lock for statemine
      const assetBalance: IAssetBalance = {
        total: () => {
          return balance;
        },
        transferable: () => {
          return balance;
        },
      };

      onUpdate(assetBalance);
    });
  }

  return {
    subscribe,
    subscribeStatemineAssets,
  };
};
