import type { dot } from '@polkadot-api/descriptors';
import type { ChainDefinition, TypedApi } from 'polkadot-api';

export type BatchMode = 'BATCH' | 'BATCH_ALL' | 'FORCE_BATCH';

export type GenericApi<T extends ChainDefinition = typeof dot> = {
  type: 'generic';
  api: TypedApi<T>;
};
