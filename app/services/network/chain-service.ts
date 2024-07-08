import { concat, sortBy } from 'lodash';

import { nonNullable } from '@/common/utils';
import DEVELOPMENT_CHAINS from '@/config/chains/chains_dev.json';
import PRODUCTION_CHAINS from '@/config/chains/chains_prod.json';
import { type Chain } from '@/types/substrate';

const CHAINS: Record<string, Chain[]> = {
  chains_prod: PRODUCTION_CHAINS as Chain[],
  chains_dev: DEVELOPMENT_CHAINS as Chain[],
};

export const chainsService = {
  getChainsData,
  sortChains,
};

function getChainsData(params = { sort: false }): Chain[] {
  const chains = CHAINS[process.env.PUBLIC_CHAINS_FILE || 'chains_prod'];

  return params.sort ? sortChains(chains) : chains;
}

function sortChains(chains: Chain[]): Chain[] {
  let polkadot;
  let kusama;
  const parachains = [] as Chain[];
  const numberchains = [] as Chain[];

  chains.forEach(chain => {
    if (isPolkadot(chain)) polkadot = chain;
    else if (isKusama(chain)) kusama = chain;
    else if (isNameStartsWithNumber(chain)) numberchains.push(chain);
    else parachains.push(chain);
  });

  return concat([polkadot, kusama].filter(nonNullable), sortBy(parachains, 'name'), sortBy(numberchains, 'name'));
}

const RelayChains = {
  POLKADOT: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  KUSAMA: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  WESTEND: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
};
function isPolkadot(chain: Chain): boolean {
  return chain.chainId === RelayChains.POLKADOT;
}

function isKusama(chain: Chain): boolean {
  return chain.chainId === RelayChains.KUSAMA;
}

function isNameStartsWithNumber(chain: Chain): boolean {
  return /^[0-9]+/.test(chain.name);
}
