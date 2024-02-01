import { AssetPrice } from '../types';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

function getCurrencyChangeKey(currency: string): string {
  return `${currency}_24h_change`;
}

export async function getPrice(
  ids: (string | undefined)[],
  currency: string = 'usd',
  includeRateChange: boolean = true,
): Promise<AssetPrice | null> {
  const url = new URL(`${COINGECKO_URL}/simple/price`);
  url.search = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: currency,
    include_24hr_change: includeRateChange.toString(),
  }).toString();

  try {
    const response = await fetch(url);
    const data = await response.json();

    return ids.reduce<AssetPrice>((acc, assetId) => {
      if (!assetId) return acc;
      acc[assetId] = {
        price: data[assetId][currency],
        change: data[assetId][getCurrencyChangeKey(currency)],
      };

      return acc;
    }, {});
  } catch (e) {
    return null;
  }
}
