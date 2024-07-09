import { type ChainMetadata } from '@/types/substrate';

export const networkUtils = {
  getNewestMetadata,
};

function getNewestMetadata(metadata: ChainMetadata[]): Record<ChainId, ChainMetadata> {
  return metadata.reduce<Record<ChainId, ChainMetadata>>((acc, data) => {
    if (data.version >= (acc[data.chainId]?.version || -1)) {
      acc[data.chainId] = data;
    }

    return acc;
  }, {});
}
