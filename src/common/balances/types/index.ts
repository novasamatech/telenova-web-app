import {BN} from '@polkadot/util';

export interface IAssetBalance {
    total: () => string;
    transferable: () => string;
};