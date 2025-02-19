import { BigNumber } from "@payvo/helpers";

import Fixture from "../test/fixtures/client/two/wallet.json";
import { WalletData } from "./wallet.dto";
import { createService } from "../test/mocking";

let subject: WalletData;

beforeEach(() => (subject = createService(WalletData).fill(Fixture.data[0])));

describe("WalletData", () => {
	test("#address", () => {
		expect(subject.address()).toBe("6566229458323231555L");
	});

	test("#publicKey", () => {
		expect(subject.publicKey()).toBe("d121d3abf5425fdc0f161d9ddb32f89b7750b4bdb0bff7d18b191d4b4bafa6d4");
	});

	test("#balance", () => {
		expect(subject.balance().available).toEqual(BigNumber.make("-9999333679754263"));
	});
});
