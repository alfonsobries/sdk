import "jest-extended";

import { IoC, Services, Signatories } from "@payvo/sdk";
import nock from "nock";

import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { DataTransferObjects } from "./coin.dtos";
import { SignedTransactionData } from "./signed-transaction.dto";
import { AddressService } from "./address.service";
import { ClientService } from "./client.service";
import { KeyPairService } from "./key-pair.service";
import { PublicKeyService } from "./public-key.service";
import { TransactionService } from "./transaction.service";

let subject: TransactionService;

beforeAll(async () => {
	subject = createService(TransactionService, undefined, (container) => {
		container.constant(IoC.BindingType.Container, container);
		container.singleton(IoC.BindingType.AddressService, AddressService);
		container.singleton(IoC.BindingType.ClientService, ClientService);
		container.constant(IoC.BindingType.DataTransferObjects, DataTransferObjects);
		container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
		container.singleton(IoC.BindingType.KeyPairService, KeyPairService);
		container.singleton(IoC.BindingType.PublicKeyService, PublicKeyService);
	});
});

afterEach(() => nock.cleanAll());

beforeAll(() => {
	nock.disableNetConnect();
});

describe("TransactionService", () => {
	describe("#transfer", () => {
		it("should sign transaction", async () => {
			nock("https://proxy.nanos.cc/")
				.post("/proxy/")
				.reply(200, require(`${__dirname}/../test/fixtures/client/account-info.json`));

			const result = await subject.transfer({
				signatory: new Signatories.Signatory(
					new Signatories.MnemonicSignatory({
						signingKey: identity.mnemonic,
						address: identity.address,
						publicKey: identity.publicKey,
						privateKey: identity.privateKey,
					}),
				),
				data: {
					amount: 100,
					to: identity.address,
				},
			});

			expect(result).toBeInstanceOf(SignedTransactionData);
			expect(result.amount().toString()).toBe("100000000000000000000000000000000");
		});
	});
});
