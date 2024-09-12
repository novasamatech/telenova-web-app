import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';

import { type TransactionType } from '../types';

export const SUBMITTABLE_EXTRINSICS: Record<
  TransactionType,
  (args: Record<string, any>, api: ApiPromise) => SubmittableExtrinsic<'promise'>
> = {
  TRANSFER: ({ dest, value }, api) => {
    return api.tx.balances['transferKeepAlive']
      ? api.tx.balances['transferKeepAlive'](dest, value)
      : api.tx.balances['transfer'](dest, value);
  },
  TRANSFER_STATEMINE: ({ dest, value, asset }, api) => {
    return api.tx.assets.transfer(asset, dest, value);
  },
  TRANSFER_ORML: ({ dest, value, asset }, api) => {
    return api.tx['tokens']['transfer'](dest, asset, value);
  },
  TRANSFER_ALL: ({ dest }, api) => {
    return api.tx.balances.transferAll(dest, false);
  },
};
