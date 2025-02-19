import { Networks } from "@payvo/sdk";

export const transactions: Networks.NetworkManifestTransactions = {
	expirationType: "height",
	types: ["delegate-registration", "second-signature", "transfer", "vote"],
	fees: {
		type: "static",
		ticker: "LSK",
	},
	memo: true,
	multiSignatureType: "standard",
};

export const importMethods: Networks.NetworkManifestImportMethods = {
	address: {
		default: false,
		permissions: ["read"],
	},
	bip39: {
		default: true,
		permissions: ["read", "write"],
	},
	publicKey: {
		default: false,
		permissions: ["read"],
	},
	secret: {
		default: false,
		permissions: ["read", "write"],
		canBeEncrypted: true,
	},
};

export const featureFlags: Networks.NetworkManifestFeatureFlags = {
	Client: ["transaction", "transactions", "wallet", "wallets", "delegate", "delegates", "votes", "broadcast"],
	Fee: ["all"],
	Address: ["mnemonic.bip39", "publicKey", "validate"],
	KeyPair: ["mnemonic.bip39"],
	PrivateKey: ["mnemonic.bip39"],
	PublicKey: ["mnemonic.bip39"],
	Ledger: ["getVersion", "getPublicKey", "signTransaction", "signMessage"],
	Message: ["sign", "verify"],
	Transaction: [
		"delegateRegistration",
		"multiSignature",
		"secondSignature",
		"transfer.ledgerS",
		"transfer.ledgerX",
		"transfer",
		"vote.ledgerS",
		"vote.ledgerX",
		"vote",
	],
};
