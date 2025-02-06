import { type PolkadotClient } from 'polkadot-api';

import type { Asset, StatemineAsset } from '@/types/substrate';

import { NativeTransferService } from './native-transfer';
import { StatemineTransferService } from './statemine-transfer';
import { type ITransfer } from './types';

export const transferFactory = {
  createService,
};

function createService(chainId: ChainId, client: PolkadotClient, asset: Asset): ITransfer {
  const SERVICES: Record<Asset['type'], (chainId: ChainId, client: PolkadotClient, asset: Asset) => ITransfer> = {
    native: (chainId, client) => new NativeTransferService(chainId, client),
    statemine: (chainId, client, asset) => new StatemineTransferService(chainId, client, asset as StatemineAsset),
    // FIXME: Cannot load metadata and produce descriptors for ORML chains
    // Status -> https://github.com/polkadot-api/compliant-RPCs/tree/main
    // orml: (client, asset) => new OrmlTransferService(client, asset as OrmlAsset),
  };

  return SERVICES[asset.type](chainId, client, asset);
}
