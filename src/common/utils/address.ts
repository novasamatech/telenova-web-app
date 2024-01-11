import { isHex, isU8a, u8aToU8a } from '@polkadot/util';
import { base58Decode, checkAddressChecksum } from '@polkadot/util-crypto';
import { AccountId, Address } from '../types';

const ADDRESS_ALLOWED_ENCODED_LENGTHS = [35, 36, 37, 38];
const ACCOUNT_ID_LENGTH = 32;

/**
 * Check is account's address valid
 * @param address account's address
 * @return {Boolean}
 */
export const validateAddress = (address?: Address | AccountId): boolean => {
  if (!address) return false;

  if (isU8a(address) || isHex(address)) {
    return u8aToU8a(address).length === ACCOUNT_ID_LENGTH;
  }

  try {
    const decoded = base58Decode(address);
    if (!ADDRESS_ALLOWED_ENCODED_LENGTHS.includes(decoded.length)) return false;

    const [isValid, endPos, ss58Length] = checkAddressChecksum(decoded);

    return isValid && Boolean(decoded.slice(ss58Length, endPos));
  } catch (error) {
    return false;
  }
};

export async function shareQrAddress(symbol: string, address: string) {
  const canvasElement = document.getElementById(`qrcode_${symbol}`) as HTMLCanvasElement;
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

  navigator.share(shareData).catch((error) => console.warn(error));
}
