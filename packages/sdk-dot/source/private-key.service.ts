import { IoC, Services } from "@payvo/sdk";
import { u8aToHex } from "@polkadot/util";
import { mnemonicToMiniSecret, naclKeypairFromSeed } from "@polkadot/util-crypto";

@IoC.injectable()
export class PrivateKeyService extends Services.AbstractPrivateKeyService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		return { privateKey: u8aToHex(naclKeypairFromSeed(mnemonicToMiniSecret(mnemonic)).secretKey) };
	}
}
