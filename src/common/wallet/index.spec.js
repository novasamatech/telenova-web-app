import { encryptMnemonic, decryptMnemonic } from './store';

describe("Encrypting/Decrypting secret", () => {
  it("should decrypt secret after encryption", () => {
  	const password = "my password"
  	const secret = "super secret string"
    const encrypted = encrypt(secret, password);
    const descrypted = decrypt(encrypted, password);

    expect(descrypted.toEqual(secret));
  });
});