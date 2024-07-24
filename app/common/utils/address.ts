import { isHex, isU8a, u8aToU8a } from '@polkadot/util';
import { base58Decode, checkAddressChecksum, decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { SS58_DEFAULT_PREFIX } from '@/common/utils/constants';

const ADDRESS_ALLOWED_ENCODED_LENGTHS = [35, 36, 37, 38];
const ACCOUNT_ID_LENGTH = 32;

/**
 * Format address or accountId with prefix and chunk size
 * Example: chunk = 6, would produce address like  1ChFWe...X7iTVZ
 * @param value account address or accountId
 * @param params chunk and prefix (default is 42)
 * @return {String}
 */
export const toAddress = (value: Address | AccountId, params?: { chunk?: number; prefix?: number }): Address => {
  const chunkValue = params?.chunk;
  const prefixValue = params?.prefix ?? SS58_DEFAULT_PREFIX;

  let address = '';
  try {
    address = encodeAddress(decodeAddress(value), prefixValue);
  } catch {
    address = value;
  }

  return chunkValue ? toShortAddress(address, chunkValue) : address;
};

/**
 * Get short address representation
 * `5DXYNRXmNmFLFxxUjMXSzKh3vqHRDfDGGbY3BnSdQcta1SkX --> 5DXYNR...ta1SkX`
 * @param address value to make short
 * @param chunk how many letters should be visible from start/end
 * @return {String}
 */
export const toShortAddress = (address: Address, chunk = 6): string => {
  return address.length < 13 ? address : truncate(address, chunk, chunk);
};

/**
 * Truncate text leaving fixed number of characters
 * @param text text to truncate
 * @param start number of leading symbols
 * @param end number of ending symbols
 * @return {String}
 */
export const truncate = (text: string, start = 5, end = 5): string => {
  if (text.length <= start + end) return text;

  return `${text.slice(0, start)}...${text.slice(-1 * end)}`;
};

/**
 * Check is account's address valid
 * @param address account's address
 * @return {Boolean}
 */
export const validateAddress = (address?: Address | AccountId): boolean => {
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
  } catch (error) {
    return false;
  }
};

export async function shareQrAddress(symbol: string, address: string) {
  const canvasElement = document.getElementById(`qrcode_${symbol}`) as HTMLCanvasElement | null;

  if (!canvasElement || !('toDataURL' in canvasElement)) {
    throw new Error(`Element qrcode_${symbol} is not a canvas element`);
  }

  const dataUrl = canvasElement.toDataURL();
  const blob = await (await fetch(dataUrl)).blob();

  const file = new File([blob], 'qrcode.png', {
    type: blob.type,
    lastModified: new Date().getTime(),
  });

  const shareData = {
    files: [file],
    text: address,
  };

  navigator.share(shareData).catch(error => console.warn(error));
}
