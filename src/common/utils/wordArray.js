// eslint-disable-next-line @typescript-eslint/no-var-requires
const WordArray = require('crypto-js/lib-typedarrays.js');

export function convertUint8ArrayToWordArray(typedArray) {
  var typedArrayByteLength = typedArray.byteLength;

  // we need to store in big endian Uint32 byte array
  var words = [];
  for (var i = 0; i < typedArrayByteLength; i++) {
    words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
  }

  return WordArray.create(words, typedArrayByteLength);
}
