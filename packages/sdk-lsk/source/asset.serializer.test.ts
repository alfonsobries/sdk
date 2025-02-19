import "jest-extended";

import { createService } from "../test/mocking";
import { AssetSerializer } from "./asset.serializer";

describe.each([
	{
		moduleID: 2,
		assetID: 0,
		asset: { recipientAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7", amount: "100000000", data: "" },
	},
	{
		moduleID: 4,
		assetID: 0,
		asset: {
			numberOfSignatures: 2,
			mandatoryKeys: [
				"5948cc0565a3e9320c7442cecb62acdc92b428a0da504c52afb3e84a025d221f",
				"a3c22fd67483ae07134c93224384dac7206c40b1b7a14186dd2d3f0dcc8234ff",
			],
			optionalKeys: [],
		},
	},
	{
		moduleID: 5,
		assetID: 0,
		asset: { username: "johndoe" },
	},
	{
		moduleID: 5,
		assetID: 1,
		asset: { votes: [{ delegateAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7", amount: `${10e8}` }] },
	},
])("AssetSerializer (%s)", ({ moduleID, assetID, asset }) => {
	test("#toMachine", () => {
		expect(createService(AssetSerializer).toMachine(moduleID, assetID, asset)).toMatchSnapshot();
	});
});
