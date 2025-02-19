import { Exceptions, IoC, Services } from "@payvo/sdk";
import { Buffoon } from "@payvo/cryptography";
import Wallet from "ethereumjs-wallet";

@IoC.injectable()
export class PublicKeyService extends Services.AbstractPublicKeyService {
	@IoC.inject(IoC.BindingType.PrivateKeyService)
	protected readonly privateKeyService!: Services.PrivateKeyService;

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PublicKeyDataTransferObject> {
		try {
			const { privateKey } = await this.privateKeyService.fromMnemonic(mnemonic, options);
			const keyPair = Wallet.fromPrivateKey(Buffoon.fromHex(privateKey));

			return { publicKey: keyPair.getPublicKey().toString("hex") };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
