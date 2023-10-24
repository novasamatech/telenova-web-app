import {HexString} from '@common/types';
import {ITelegramMessageFactory} from './types';
import {convertUint8ArrayToWordArray} from '@common/utils/wordArray';

const {
    u8aToHex,
    hexToU8a
} = require('@polkadot/util');

enum MessageType {
    WalletCreated = 0,
    ExtrinsicSubmitted = 1
};

const Hmac = require('crypto-js/hmac-sha512.js');
const CryptoJSHex = require('crypto-js/enc-hex.js')

function preparePayload(secretKey: string, type: MessageType, content: Uint8Array): Uint8Array {
    var messageContent = new Uint8Array(1 + content.length);
    messageContent[0] = type;
    messageContent.set(content, 1);

    const hashHex = Hmac(convertUint8ArrayToWordArray(messageContent), secretKey).toString(CryptoJSHex);
    const hash = hexToU8a(hashHex);

    var message = new Uint8Array(hash.length + messageContent.length);
    message.set(hash);
    message.set(messageContent, hash.length);

    return message;
}

export function signedWalletCreationData(publicKey: HexString, secretKey: string): HexString | null {
    const content = hexToU8a(publicKey);
    const payload = preparePayload(secretKey, MessageType.WalletCreated, content);
    return u8aToHex(payload);
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
        const secretKey = getSecretKey();

        if (secretKey) {
            return signedWalletCreationData(publicKey, secretKey);
        } else {
            return null
        }
    }

    return {
        prepareWalletCreationData
    };
}