import { Networks } from "@payvo/sdk";

import { explorer, featureFlags, importMethods, transactions } from "./shared";

const network: Networks.NetworkManifest = {
	id: "avax.mainnet",
	type: "live",
	name: "Mainnet",
	coin: "Avalanche",
	currency: {
		ticker: "AVAX",
		symbol: "AVAX",
		decimals: 9,
	},
	constants: {
		slip44: 9000,
	},
	hosts: [
		{
			type: "full",
			host: "https://api.avax.network:443",
		},
		{
			type: "archival",
			host: "https://api.avax.network:8080",
		},
		{
			type: "explorer",
			host: "https://explorer.avax.network",
		},
	],
	transactions,
	importMethods,
	featureFlags,
	explorer,
	meta: {
		// @TODO
		networkId: "1",
		blockchainId: "2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM",
		assetId: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
	},
};

export default network;
