import { Coins, Exceptions, IoC, Services } from "@payvo/sdk";
import { BIP39 } from "@payvo/cryptography";

import { derivePrivateKey } from "./keys";

@IoC.injectable()
export class PrivateKeyService extends Services.AbstractPrivateKeyService {
	#slip44!: number;

	@IoC.postConstruct()
	private onPostConstruct(): void {
		this.#slip44 = this.configRepository.get<number>("network.constants.slip44");
	}

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		if (!BIP39.validate(mnemonic)) {
			throw new Exceptions.InvalidArguments(this.constructor.name, this.fromMnemonic.name);
		}

		return {
			privateKey: derivePrivateKey(
				mnemonic,
				options?.bip44?.account || 0,
				options?.bip44?.addressIndex || 0,
				this.#slip44,
			).toString("hex"),
		};
	}
}
