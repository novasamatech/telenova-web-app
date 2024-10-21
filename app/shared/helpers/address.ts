import { isHex, isU8a, u8aToU8a } from '@polkadot/util';
import { base58Decode, checkAddressChecksum, encodeAddress } from '@polkadot/util-crypto';
import { ethereumEncode } from '@polkadot/util-crypto/ethereum/encode';

import { isEvmChain } from '@/shared/helpers/chains.ts';
import { SS58_DEFAULT_PREFIX } from '@/shared/helpers/constants';
import { type Chain } from '@/types/substrate';

const ADDRESS_ALLOWED_ENCODED_LENGTHS = [35, 36, 37, 38];
const PUBLIC_KEY_LENGTH_BYTES = 32;
const ETHEREUM_PUBLIC_KEY_LENGTH_BYTES = 20;

/**
 * Format address or publicKey with prefix and chunk size Example: chunk = 6,
 * would produce address for Substrate - 1ChFWe...X7iTVZ or Ethereum -
 * 0x2Gs34b...Hg4aSx
 *
 * @param value Address or PublicKey
 * @param params Chain and chunk
 *
 * @returns {String}
 */
export const toAddress = (
  value: Address | PublicKey | Uint8Array,
  params: { chain: Chain; chunk?: number },
): Address => {
  let address = '';

  const prefixValue = params.chain.addressPrefix ?? SS58_DEFAULT_PREFIX;
  try {
    address = isEvmChain(params.chain) ? ethereumEncode(value) : encodeAddress(value, prefixValue);
  } catch {
    address = isU8a(value) ? '' : value;
  }

  return params.chunk ? toShortAddress(address, params.chunk) : address;
};

/**
 * Get short address representation
 * `5DXYNRXmNmFLFxxUjMXSzKh3vqHRDfDGGbY3BnSdQcta1SkX --> 5DXYNR...ta1SkX`
 * `0x629C0eC6B23D0E3A2f67c2753660971faa9A1907 --> 0x629C0e...9A1907`
 *
 * @param address Value to make short
 * @param chunk How many letters should be visible from start/end
 *
 * @returns {String}
 */
export const toShortAddress = (address: Address, chunk = 6): string => {
  const start = isHex(address) ? chunk + 2 : chunk;

  return address.length < 13 ? address : truncate(address, start, chunk);
};

/**
 * Truncate text leaving fixed number of characters
 *
 * @param text Text to truncate
 * @param start Number of leading symbols
 * @param end Number of ending symbols
 *
 * @returns {String}
 */
const truncate = (text: string, start = 6, end = 6): string => {
  if (text.length <= start + end) return text;

  return `${text.slice(0, start)}...${text.slice(-1 * end)}`;
};

/**
 * Check is account's address valid
 *
 * @param address Account's address
 * @param chain Chain to operate
 *
 * @returns {Boolean}
 */
export const validateAddress = (address: Address | PublicKey, chain: Chain): boolean => {
  return isEvmChain(chain) ? validateEvmAddress(address) : validateSubstrateAddress(address);
};

function validateSubstrateAddress(address: Address | PublicKey): boolean {
  try {
    if (isU8a(address) || isHex(address)) {
      return u8aToU8a(address).length === PUBLIC_KEY_LENGTH_BYTES;
    }

    const decoded = base58Decode(address);
    if (!ADDRESS_ALLOWED_ENCODED_LENGTHS.includes(decoded.length)) return false;

    const [isValid, endPos, ss58Length] = checkAddressChecksum(decoded);

    return isValid && Boolean(decoded.slice(ss58Length, endPos));
  } catch {
    return false;
  }
}

function validateEvmAddress(address: Address | PublicKey): boolean {
  try {
    if (!isU8a(address) && !isHex(address)) return false;

    return u8aToU8a(address).length === ETHEREUM_PUBLIC_KEY_LENGTH_BYTES;
  } catch {
    return false;
  }
}
