import { nonNullable } from '@/shared/helpers';
import { type Asset, type AssetPrices } from '@/types/substrate';

export const coingekoApi = {
  getPrice,
};

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

async function getPrice(
  priceIds: Asset['priceId'][],
  currency = 'usd',
  includeRateChange = true,
): Promise<AssetPrices | null> {
  const ids = priceIds.filter(nonNullable);
  if (ids.length === 0) return Promise.resolve(null);

  const url = new URL(`${COINGECKO_URL}/simple/price`);

  url.search = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: currency,
    include_24hr_change: includeRateChange.toString(),
  }).toString();

  const data = await fetch(url, { cache: 'default' }).then(r => r.json());

  return ids.reduce<AssetPrices>((acc, priceId) => {
    acc[priceId] = {
      price: data[priceId][currency],
      change: data[priceId][`${currency}_24h_change`],
    };

    return acc;
  }, {});
}
