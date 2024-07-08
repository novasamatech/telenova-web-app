import { type AssetPrice } from '../types';

type Params = {
  ids: string[];
  currency?: string;
  includeRateChange?: boolean;
  abortSignal?: AbortSignal;
};

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

function getCurrencyChangeKey(currency: string): string {
  return `${currency}_24h_change`;
}

export async function getPrice({
  ids,
  currency = 'usd',
  includeRateChange = true,
  abortSignal,
}: Params): Promise<AssetPrice | null> {
  const url = new URL(`${COINGECKO_URL}/simple/price`);
  url.search = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: currency,
    include_24hr_change: includeRateChange.toString(),
  }).toString();

  try {
    const data = await fetch(url, { signal: abortSignal }).then(r => r.json());
    const prices: AssetPrice = {};

    for (const assetId of ids) {
      prices[assetId] = {
        price: data[assetId][currency],
        change: data[assetId][getCurrencyChangeKey(currency)],
      };
    }

    return prices;
  } catch (e) {
    console.error(e);

    return null;
  }
}
