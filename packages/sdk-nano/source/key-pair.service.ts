import { Exceptions, IoC, Services } from "@payvo/sdk";

import { deriveAccount } from "./account";

@IoC.injectable()
export class KeyPairService extends Services.AbstractKeyPairService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.KeyPairDataTransferObject> {
		try {
			const { publicKey, privateKey } = deriveAccount(mnemonic, options?.bip44?.account);

			return { publicKey, privateKey };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
