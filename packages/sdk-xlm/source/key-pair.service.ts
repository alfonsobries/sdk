import { Exceptions, IoC, Services } from "@payvo/sdk";
import Stellar from "stellar-sdk";

import { deriveKeyPair } from "./helpers";

@IoC.injectable()
export class KeyPairService extends Services.AbstractKeyPairService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.KeyPairDataTransferObject> {
		try {
			const { child, path } = deriveKeyPair(mnemonic, options);

			return {
				publicKey: child.publicKey(),
				privateKey: child.secret(),
				path,
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async fromPrivateKey(privateKey: string): Promise<Services.KeyPairDataTransferObject> {
		try {
			const source = Stellar.Keypair.fromSecret(privateKey);

			return {
				publicKey: source.publicKey(),
				privateKey: source.secret(),
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
