import { HexString } from '@common/types';
import { ITelegramMessageFactory } from './types';

const {
	u8aToHex,
	hexToU8a
} = require('@polkadot/util');

enum MessageType {
	WalletCreated = 0,
	ExtrinsicSubmitted = 1
};

const HASH_LENGTH = 64;
const Hmac = require('crypto-js/hmac-sha3.js');
const CryptoJSHex = require('crypto-js/enc-hex.js')

// https://gist.github.com/getify/7325764#file-gistfile1-js-L24
function convertUint8ArrayToWordArray(u8Array: Uint8Array) {
	var words = [], i = 0, len = u8Array.length;

	while (i < len) {
		words.push(
			(u8Array[i++] << 24) |
			(u8Array[i++] << 16) |
			(u8Array[i++] << 8)  |
			(u8Array[i++])
		);
	}

	return {
		sigBytes: words.length * 4,
		words: words
	};
}

function preparePayload(secretKey: string, type: MessageType, content: Uint8Array): Uint8Array {
	var messageContent = new Uint8Array(1 + content.length);
	messageContent[0] = type;
	messageContent.set(content, 1);

	const hash = Hmac(secretKey, convertUint8ArrayToWordArray(messageContent)).toString(CryptoJSHex);

	var message = new Uint8Array(HASH_LENGTH + 1 + content.length);
	message.set(hexToU8a(hash));
	message.set(messageContent, HASH_LENGTH);

	return message;
}

export const getMessageFactory = (): ITelegramMessageFactory => {
	function getSecretKey(): string | null {
		const secretKey = process.env.NEXT_PUBLIC_BOT_KEY

		if (secretKey) {
			return secretKey;
		} else {
			return null;
		}
	}

	function prepareWalletCreationData(publicKey: HexString): HexString | null {
		const content = hexToU8a(publicKey);
		const secretKey = getSecretKey()

		if (secretKey) {
			const payload = preparePayload(secretKey, MessageType.WalletCreated, content);

			return u8aToHex(payload);
		} else {
			return null
		}
	}

	return {
		prepareWalletCreationData
	};
}