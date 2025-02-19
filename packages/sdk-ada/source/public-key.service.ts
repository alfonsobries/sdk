import { Exceptions, IoC, Services } from "@payvo/sdk";

import { KeyPairService } from "./key-pair.service";

@IoC.injectable()
export class PublicKeyService extends Services.AbstractPublicKeyService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PublicKeyDataTransferObject> {
		try {
			return {
				publicKey: (await new KeyPairService().fromMnemonic(mnemonic, options)).publicKey,
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
