import { concat, sortBy } from 'lodash-es';

import { nonNullable } from '@/shared/helpers';
import { KUSAMA, POLKADOT } from '@/shared/helpers/chains';
import { type Chain } from '@/types/substrate';

export const chainsApi = {
  getChainsData,
  sortChains,
};

type DataParams = {
  file: 'chains_dev' | 'chains_prod';
  sort?: boolean;
};
async function getChainsData({ file, sort }: DataParams): Promise<Chain[]> {
  const url = `https://raw.githubusercontent.com/novasamatech/telenova-utils/main/chains/v1/${file}.json`;
  const chains = await fetch(url).then(response => response.json());

  return sort ? sortChains(chains) : chains;
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

function isPolkadot(chain: Chain): boolean {
  return chain.chainId === POLKADOT;
}

function isKusama(chain: Chain): boolean {
  return chain.chainId === KUSAMA;
}

function isNameStartsWithNumber(chain: Chain): boolean {
  return /^[0-9]+/.test(chain.name);
}
