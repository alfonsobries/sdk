import { Test } from "@payvo/sdk";
import { Request } from "@payvo/http-got";

import { manifest } from "../source/manifest";
import { schema } from "../source/coin.schema";

export const createService = <T = any>(service: any, network: string = "eos.testnet", predicate?: Function): T => {
	return Test.createService({
		httpClient: new Request(),
		manifest: manifest.networks[network],
		predicate,
		schema,
		service,
	});
};
