import "jest-extended";

import { Services } from "@payvo/sdk";

import { createService } from "../test/mocking";

let subject: Services.AbstractLinkService;

beforeAll(async () => {
	subject = createService(Services.AbstractLinkService);
});

it("should generate a link for a block", async () => {
	expect(subject.block("id")).toMatchInlineSnapshot(`"https://gaia.stake.id/blocks/id"`);
});

it("should generate a link for a transaction", async () => {
	expect(subject.transaction("id")).toMatchInlineSnapshot(`"https://gaia.stake.id/transactions/id"`);
});

it("should generate a link for a wallet", async () => {
	expect(subject.wallet("id")).toMatchInlineSnapshot(`"https://gaia.stake.id/account/id"`);
});
