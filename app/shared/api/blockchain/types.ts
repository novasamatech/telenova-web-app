import type { ChainDefinition, TypedApi } from 'polkadot-api';

export type BatchMode = 'BATCH' | 'BATCH_ALL' | 'FORCE_BATCH';

export type GenericApi<A extends ChainDefinition> = {
  type: 'generic';
  api: TypedApi<A>;
};

export type ParaApi<T extends string, A extends ChainDefinition> = {
  type: T;
  api: TypedApi<A>;
};
