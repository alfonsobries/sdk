import { Coins, Exceptions, IoC, Services } from "@payvo/sdk";
import { BIP44 } from "@payvo/cryptography";
import { deriveAddress, deriveKeypair } from "ripple-keypairs";

@IoC.injectable()
export class AddressService extends Services.AbstractAddressService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		// @TODO: return path
		return this.fromPublicKey(
			BIP44.deriveChild(mnemonic, {
				coinType: this.configRepository.get(Coins.ConfigKey.Slip44),
				index: options?.bip44?.addressIndex,
			}).publicKey.toString("hex"),
		);
	}

	public override async fromPublicKey(
		publicKey: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		try {
			return { type: "rfc6979", address: deriveAddress(publicKey) };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async fromSecret(secret: string): Promise<Services.AddressDataTransferObject> {
		return { type: "rfc6979", address: deriveAddress(deriveKeypair(secret).publicKey) };
	}

	public override async validate(address: string): Promise<boolean> {
		return true;
	}
}
