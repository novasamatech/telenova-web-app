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

  chains.push({
    name: 'Moonbeam',
    specName: 'polkadot',
    addressPrefix: 1284,
    chainId: '0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d',
    parentId: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    icon: 'https://raw.githubusercontent.com/novasamatech/telenova-utils/main/icons/v1/chains/Moonbeam.svg',
    options: ['evm'],
    nodes: [
      {
        url: 'wss://wss.api.moonbeam.network',
        name: 'Moonbeam Foundation node',
      },
      {
        url: 'wss://moonbeam.ibp.network',
        name: 'IBP1 node',
      },
      {
        url: 'wss://moonbeam.dotters.network',
        name: 'IBP2 node',
      },
      {
        url: 'wss://moonbeam.public.curie.radiumblock.co/ws',
        name: 'RadiumBlock node',
      },
      {
        url: 'wss://moonbeam.public.blastapi.io',
        name: 'Blast node',
      },
    ],
    assets: [
      {
        assetId: 0,
        symbol: 'GLMR',
        precision: 18,
        priceId: 'moonbeam',
        type: 'native',
        icon: 'https://raw.githubusercontent.com/novasamatech/telenova-utils/main/icons/v1/assets/color/Moonbeam_(GLMR).svg',
        name: 'Moonbeam',
      },
    ],
  });

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
