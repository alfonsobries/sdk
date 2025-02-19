import { IoC, Services } from "@payvo/sdk";
import { Wallet } from "@zilliqa-js/account";

import { BindingType } from "./constants";
import { accountFromMnemonic } from "./zilliqa";

@IoC.injectable()
export class PublicKeyService extends Services.AbstractPublicKeyService {
	@IoC.inject(BindingType.Wallet)
	private readonly wallet!: Wallet;

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PublicKeyDataTransferObject> {
		return {
			publicKey: (await accountFromMnemonic(this.wallet, mnemonic, options)).publicKey,
		};
	}
}
