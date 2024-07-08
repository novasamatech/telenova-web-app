import { type ChainMetadata } from '@/types/substrate';

import { type Connection } from './types.ts';

export const networkUtils = {
  isDisabledConnection,
  isEnabledConnection,
  getNewestMetadata,
};

function isDisabledConnection(connection: Connection): boolean {
  return connection.connectionType === 'disabled';
}

function isEnabledConnection(connection: Connection): boolean {
  return connection.connectionType === 'enabled';
}

function getNewestMetadata(metadata: ChainMetadata[]): Record<ChainId, ChainMetadata> {
  return metadata.reduce<Record<ChainId, ChainMetadata>>((acc, data) => {
    if (data.version >= (acc[data.chainId]?.version || -1)) {
      acc[data.chainId] = data;
    }

    return acc;
  }, {});
}
