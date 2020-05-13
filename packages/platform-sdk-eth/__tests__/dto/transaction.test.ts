import "jest-extended";
import { Utils } from "@arkecosystem/platform-sdk";

import { TransactionData } from "../../src/dto";
import Fixture from "../__fixtures__/client/transaction.json";

let subject: TransactionData;

beforeEach(() => (subject = new TransactionData(Fixture)));

describe("TransactionData", function () {
	test("#id", () => {
		expect(subject.id()).toBe("0x35a28a5b1785d3729afc809851466fcc9971d09922196a1ca6d155756c222435");
	});

	test("#type", () => {
		expect(subject.type()).toBeUndefined();
	});

	test("#typeGroup", () => {
		expect(subject.typeGroup()).toBeUndefined();
	});

	test("#timestamp", () => {
		expect(subject.timestamp()).toBeUndefined();
	});

	test("#confirmations", () => {
		expect(subject.confirmations()).toEqual(Utils.BigNumber.ZERO);
	});

	test("#sender", () => {
		expect(subject.sender()).toBe("0x4581A610f96878266008993475F1476cA9997081");
	});

	test("#recipient", () => {
		expect(subject.recipient()).toBe("0x230b2A8C0CcE28fd6eFF491c47aeBa244b10A12c");
	});

	test("#amount", () => {
		expect(subject.amount()).toEqual(Utils.BigNumber.make("79000000000000"));
	});

	test("#fee", () => {
		expect(subject.fee()).toEqual(Utils.BigNumber.make("21000"));
	});

	test("#memo", () => {
		expect(subject.memo()).toBeUndefined();
	});

	test("#toObject", () => {
		expect(subject.toObject()).toBeObject();
	});

	test("#raw", () => {
		expect(subject.raw()).toEqual(Fixture);
	});
});
