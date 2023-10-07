import { signedWalletCreationData } from '@common/telegram/message-factory';

type MessageTestWalletCreationItem = {
	publicKey: HexString,
	secretKey: string,
	expectedPayload: HexString
};

describe("Message factory payload creation", () => {
  	test("Wallet creation payload", () => {
  		// calculated using sha512 from https://www.liavaag.org/English/SHA-Generator/HMAC/
    	const testVectors: [MessageTestWalletCreationItem] = [
    		{
    			publicKey: "0x1111111111111111111111111111111111111111111111111111111111111111",
    			secretKey: "test_secret",
    			expectedPayload: "0xb1a0d0c04c47e59f1f20cb1a070299098da82a8227f1482fe12f4111d3316db83fc02e4799f749984c76115687369d4a1f5db1ef7d6b1e1fdd79fe8674b20aab001111111111111111111111111111111111111111111111111111111111111111"
    		},
    		{
    			publicKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
    			secretKey: "test_secret",
    			expectedPayload: "0x7934174ce35a5e9bf510229be6f087ebd107f70dd60b0c05dbecf5b673247afc1a42ee7d61e271218d5a0f609bc5e6d1dab47cf06b4e0076ec7f68a092225e8f000000000000000000000000000000000000000000000000000000000000000000"
    		}
    	]

    	for(const testVector of testVectors) {
    		const actualPayload = signedWalletCreationData(testVector.publicKey, testVector.secretKey);
    		expect(actualPayload).toEqual(testVector.expectedPayload);
    	}
  	});
});