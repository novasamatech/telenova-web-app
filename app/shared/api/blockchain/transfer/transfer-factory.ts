import { type PolkadotClient } from 'polkadot-api';

import type { Asset, StatemineAsset } from '@/types/substrate';

import { NativeTransferService } from './native-transfer';
import { StatemineTransferService } from './statemine-transfer';
import { type ITransfer } from './types';

export const transferFactory = {
  createService,
};

function createService(client: PolkadotClient, asset: Asset): ITransfer {
  const SERVICES: Record<Asset['type'], (client: PolkadotClient, asset: Asset) => ITransfer> = {
    native: client => new NativeTransferService(client),
    statemine: (client, asset) => new StatemineTransferService(client, asset as StatemineAsset),
    // orml: (client, asset) => new OrmlTransferService(client, asset as OrmlAsset),
  };

  return SERVICES[asset.type](client, asset);
}
