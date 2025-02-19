import { Exceptions, IoC, Services } from "@payvo/sdk";
import Stellar from "stellar-sdk";

import { buildPath, deriveKeyPair } from "./helpers";

@IoC.injectable()
export class AddressService extends Services.AbstractAddressService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		try {
			const { child, path } = deriveKeyPair(mnemonic, options);

			return {
				type: "bip44",
				address: child.publicKey(),
				path,
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async fromPrivateKey(
		privateKey: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		try {
			return {
				type: "bip44",
				address: Stellar.Keypair.fromSecret(privateKey).publicKey(),
				path: buildPath(options),
			};
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async validate(address: string): Promise<boolean> {
		return true;
	}
}
