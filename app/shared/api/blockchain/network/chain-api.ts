import { concat, sortBy } from 'lodash-es';

import { isChainStartsWithNumber, isKusama, isPolkadot, nonNullable } from '@/shared/helpers';
import { type Chain } from '@/types/substrate';

export const chainsApi = {
  getChainsData,
};

type DataParams = {
  file: 'chains_dev' | 'chains_prod';
  sort?: boolean;
};

async function getChainsData({ file, sort }: DataParams): Promise<Chain[]> {
  const url = `https://raw.githubusercontent.com/novasamatech/telenova-utils/main/chains/v1/${file}.json`;
  const chains = await fetch(url)
    .then(response => response.json())
    .catch(() => ({}));

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
    else if (isChainStartsWithNumber(chain)) numberchains.push(chain);
    else parachains.push(chain);
  });

  return concat([polkadot, kusama].filter(nonNullable), sortBy(parachains, 'name'), sortBy(numberchains, 'name'));
}
