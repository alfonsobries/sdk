import { Networks } from "@payvo/sdk";

import { explorer, featureFlags, importMethods, transactions } from "./shared";

const network: Networks.NetworkManifest = {
	id: "luna.mainnet",
	type: "live",
	name: "Mainnet",
	coin: "Luna",
	currency: {
		ticker: "LUNA",
		symbol: "LUNA",
		decimals: 6,
	},
	constants: {
		slip44: 330,
	},
	hosts: [
		{
			type: "full",
			host: "https://luna-lcd.terra.dev/",
		},
		{
			type: "explorer",
			host: "https://finder.terra.money/tequila-0004",
		},
	],
	transactions,
	importMethods,
	featureFlags,
	explorer,
};

export default network;
