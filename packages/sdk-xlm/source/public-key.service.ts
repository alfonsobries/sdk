import { Exceptions, IoC, Services } from "@payvo/sdk";

import { deriveKeyPair } from "./helpers";

@IoC.injectable()
export class PublicKeyService extends Services.AbstractPublicKeyService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PublicKeyDataTransferObject> {
		try {
			const { child, path } = deriveKeyPair(mnemonic, options);

			return {
				publicKey: child.publicKey(),
				path,
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
