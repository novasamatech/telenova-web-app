import Keyring from '@polkadot/keyring';
import { isHex, isU8a, u8aToU8a } from '@polkadot/util';
import { addressToEvm, base58Decode, checkAddressChecksum, decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { SS58_DEFAULT_PREFIX } from '@/shared/helpers/constants';

const ADDRESS_ALLOWED_ENCODED_LENGTHS = [35, 36, 37, 38];
const ACCOUNT_ID_LENGTH = 32;

/**
 * Format address or publicKey with prefix and chunk size Example: chunk = 6,
 * would produce address like 1ChFWe...X7iTVZ
 *
 * @param value Account address or publicKey
 * @param params Chunk and prefix (default is 42)
 *
 * @returns {String}
 */
export const toAddress = (
  value: Address | PublicKey,
  params?: {
    chunk?: number;
    prefix?: number;
    evm?: boolean;
  },
): Address => {
  const chunkValue = params?.chunk;
  const prefixValue = params?.prefix ?? SS58_DEFAULT_PREFIX;

  let address = '';
  try {
    address = params?.evm
      ? encodeAddress(addressToEvm(value), prefixValue)
      : encodeAddress(decodeAddress(value), prefixValue);
  } catch {
    address = value;
  }
  // 0x431621580885a1d9cf257Aaf0628D26Df3e9c591 - верным
  // 0x02c10463c2defc4f0b112381292461d6683538b9 - неверным

  // Import Ethereum account from mnemonic
  const keyringECDSA = new Keyring({ type: 'ethereum' });
  const mnemonic = 'jelly coast judge vehicle push nerve art ginger man damp quiz include';

  // Define index of the derivation path and the derivation path
  const index = 0;
  const ethDerPath = "m/44'/60'/0'/0/" + index;

  // Extract Ethereum address from mnemonic
  const alice = keyringECDSA.addFromUri(`${mnemonic}/${ethDerPath}`);
  console.log(`Derived Ethereum Address from Mnemonic: ${alice.address}`);

  return chunkValue ? toShortAddress(address, chunkValue) : address;
};

/**
 * Get short address representation
 * `5DXYNRXmNmFLFxxUjMXSzKh3vqHRDfDGGbY3BnSdQcta1SkX --> 5DXYNR...ta1SkX`
 *
 * @param address Value to make short
 * @param chunk How many letters should be visible from start/end
 *
 * @returns {String}
 */
export const toShortAddress = (address: Address, chunk = 6): string => {
  return address.length < 13 ? address : truncate(address, chunk, chunk);
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
export const truncate = (text: string, start = 5, end = 5): string => {
  if (text.length <= start + end) return text;

  return `${text.slice(0, start)}...${text.slice(-1 * end)}`;
};

/**
 * Check is account's address valid
 *
 * @param address Account's address
 *
 * @returns {Boolean}
 */
export const validateAddress = (address?: Address | PublicKey): boolean => {
  if (!address) {
    return false;
  }

  if (isU8a(address) || isHex(address)) {
    return u8aToU8a(address).length === ACCOUNT_ID_LENGTH;
  }

  try {
    const decoded = base58Decode(address);
    if (!ADDRESS_ALLOWED_ENCODED_LENGTHS.includes(decoded.length)) {
      return false;
    }

    const [isValid, endPos, ss58Length] = checkAddressChecksum(decoded);

    return isValid && Boolean(decoded.slice(ss58Length, endPos));
  } catch {
    return false;
  }
};
