import { Coins, Exceptions, IoC, Services } from "@payvo/sdk";
import {
	getLegacyAddressFromPassphrase,
	getLegacyAddressFromPublicKey,
	getLisk32AddressFromPassphrase,
	getLisk32AddressFromPublicKey,
	validateBase32Address,
} from "@liskhq/lisk-cryptography";
import { utils } from "@liskhq/lisk-transactions";
import { BIP39 } from "@payvo/cryptography";
import { abort_if, abort_unless } from "@payvo/helpers";
import { isTest } from "./helpers";

@IoC.injectable()
export class AddressService extends Services.AbstractAddressService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		try {
			abort_unless(BIP39.validate(mnemonic), "The given value is not BIP39 compliant.");

			if (isTest(this.configRepository)) {
				return { type: "bip39", address: getLisk32AddressFromPassphrase(mnemonic) };
			}

			return { type: "bip39", address: getLegacyAddressFromPassphrase(mnemonic) };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async fromPublicKey(
		publicKey: string,
		options?: Services.IdentityOptions,
	): Promise<Services.AddressDataTransferObject> {
		try {
			if (isTest(this.configRepository)) {
				return { type: "bip39", address: getLisk32AddressFromPublicKey(Buffer.from(publicKey, "hex")) };
			}

			return { type: "bip39", address: getLegacyAddressFromPublicKey(Buffer.from(publicKey, "hex")) };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async fromSecret(secret: string): Promise<Services.AddressDataTransferObject> {
		try {
			abort_if(BIP39.validate(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

			if (isTest(this.configRepository)) {
				return { type: "bip39", address: getLisk32AddressFromPassphrase(secret) };
			}

			return { type: "bip39", address: getLegacyAddressFromPassphrase(secret) };
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}

	public override async validate(address: string): Promise<boolean> {
		try {
			if (isTest(this.configRepository)) {
				return validateBase32Address(address);
			}

			return utils.validateAddress(address);
		} catch {
			return false;
		}
	}
}
