import { IoC, Services } from "@payvo/sdk";
import { Wallet } from "@zilliqa-js/account";

import { BindingType } from "./constants";
import { accountFromMnemonic } from "./zilliqa";

@IoC.injectable()
export class PrivateKeyService extends Services.AbstractPrivateKeyService {
	@IoC.inject(BindingType.Wallet)
	private readonly wallet!: Wallet;

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		return {
			privateKey: (await accountFromMnemonic(this.wallet, mnemonic, options)).privateKey,
		};
	}
}
