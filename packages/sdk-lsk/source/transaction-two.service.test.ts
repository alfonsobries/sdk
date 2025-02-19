import "jest-extended";

import { IoC, Services, Signatories } from "@payvo/sdk";

import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { DataTransferObjects } from "./coin.dtos";
import { AddressService } from "./address.service";
import { ClientService } from "./client-two.service";
import { KeyPairService } from "./key-pair.service";
import { LedgerService } from "./ledger.service";
import { PublicKeyService } from "./public-key.service";
import { TransactionService } from "./transaction-two.service";
import { BigNumber } from "@payvo/helpers";

let subject: TransactionService;

beforeAll(async () => {
	subject = createService(TransactionService, "lsk.mainnet", (container) => {
		container.constant(IoC.BindingType.Container, container);
		container.singleton(IoC.BindingType.AddressService, AddressService);
		container.singleton(IoC.BindingType.ClientService, ClientService);
		container.constant(IoC.BindingType.DataTransferObjects, DataTransferObjects);
		container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
		container.singleton(IoC.BindingType.KeyPairService, KeyPairService);
		container.singleton(IoC.BindingType.LedgerService, LedgerService);
		container.singleton(IoC.BindingType.PublicKeyService, PublicKeyService);
	});
});

describe("TransactionService", () => {
	describe("#transfer", () => {
		it("should create for %s", async () => {
			const result = await subject.transfer({
				signatory: new Signatories.Signatory(
					new Signatories.MnemonicSignatory({
						signingKey: identity.mnemonic,
						address: identity.addressLegacy,
						publicKey: identity.publicKey,
						privateKey: identity.privateKey,
					}),
				),
				data: {
					amount: 1,
					to: identity.addressLegacy,
				},
			});

			expect(result).toBeObject();
		});
	});

	describe("#secondSignature", () => {
		it("should verify", async () => {
			const result = await subject.secondSignature({
				signatory: new Signatories.Signatory(
					new Signatories.SecondaryMnemonicSignatory({
						signingKey: identity.mnemonic,
						confirmKey: identity.mnemonic,
						address: "15957226662510576840L",
						publicKey: "publicKey",
						privateKey: "privateKey",
					}),
				),
				data: {
					mnemonic: identity.mnemonic,
				},
			});

			expect(result).toBeObject();
		});
	});

	describe("#delegateRegistration", () => {
		it("should verify", async () => {
			const result = await subject.delegateRegistration({
				signatory: new Signatories.Signatory(
					new Signatories.MnemonicSignatory({
						signingKey: identity.mnemonic,
						address: "15957226662510576840L",
						publicKey: "publicKey",
						privateKey: "privateKey",
					}),
				),
				data: {
					username: "johndoe",
				},
			});

			expect(result).toBeObject();
		});
	});

	describe("#vote", () => {
		it("should verify", async () => {
			const result = await subject.vote({
				signatory: new Signatories.Signatory(
					new Signatories.MnemonicSignatory({
						signingKey: identity.mnemonic,
						address: "15957226662510576840L",
						publicKey: "publicKey",
						privateKey: "privateKey",
					}),
				),
				data: {
					votes: [
						{
							id: "9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f",
							amount: 0,
						},
					],
					unvotes: [],
				},
			});

			expect(result).toBeObject();
		});
	});

	// describe("#multiSignature", () => {
	// 	it("should verify", async () => {
	// 		const result = await subject.multiSignature({
	// 			signatory: new Signatories.Signatory(
	// 				new Signatories.MnemonicSignatory({
	// 					signingKey: identity.mnemonic,
	// 					address: "15957226662510576840L",
	// 					publicKey: "publicKey",
	// 					privateKey: "privateKey",
	// 				}),
	// 			),
	// 			data: {
	// 				lifetime: 34,
	// 				mandatoryKeys: [
	// 					"9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f",
	// 					"141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a",
	// 					"3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135",
	// 				],
	// 				optionalKeys: [],
	// 				numberOfSignatures: 2,
	// 			},
	// 		});

	// 		expect(result).toBeObject();
	// 	});
	// });
});
