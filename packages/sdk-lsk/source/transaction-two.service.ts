import { Contracts, Exceptions, IoC, Services } from "@payvo/sdk";
import { BIP39 } from "@payvo/cryptography";
import LedgerTransportNodeHID from "@ledgerhq/hw-transport-node-hid-singleton";
import {
	castVotes,
	registerDelegate,
	registerMultisignature,
	registerSecondPassphrase,
	TransactionJSON,
	transfer,
	utils,
} from "@liskhq/lisk-transactions";
import { BigNumber } from "@payvo/helpers";

@IoC.injectable()
export class TransactionService extends Services.AbstractTransactionService {
	@IoC.inject(IoC.BindingType.LedgerService)
	private readonly ledgerService!: Services.LedgerService;

	@IoC.inject(IoC.BindingType.AddressService)
	private readonly addressService!: Services.AddressService;

	/**
	 * @inheritDoc
	 *
	 * @ledgerX
	 * @ledgerS
	 */
	public override async transfer(input: Services.TransferInput): Promise<Contracts.SignedTransactionData> {
		return this.#createFromData("transfer", {
			...input,
			data: {
				amount: this.toSatoshi(input.data.amount).toString(),
				recipientId: input.data.to,
				data: input.data.memo,
			},
		});
	}

	public override async secondSignature(
		input: Services.SecondSignatureInput,
	): Promise<Contracts.SignedTransactionData> {
		return this.#createFromData("registerSecondPassphrase", {
			...input,
			data: {
				secondMnemonic: BIP39.normalize(input.data.mnemonic),
			},
		});
	}

	public override async delegateRegistration(
		input: Services.DelegateRegistrationInput,
	): Promise<Contracts.SignedTransactionData> {
		return this.#createFromData("registerDelegate", input);
	}

	/**
	 * @inheritDoc
	 *
	 * @ledgerX
	 * @ledgerS
	 */
	public override async vote(input: Services.VoteInput): Promise<Contracts.SignedTransactionData> {
		const mapVotes = (votes: { id: string }[]) => {
			const result: string[] = [];

			for (const vote of votes) {
				result.push(vote.id);
			}

			return result;
		};

		return this.#createFromData("castVotes", {
			...input,
			data: {
				votes: mapVotes(input.data.votes),
				unvotes: mapVotes(input.data.unvotes),
			},
		});
	}

	// public override async multiSignature(
	// 	input: Services.MultiSignatureInput,
	// ): Promise<Contracts.SignedTransactionData> {
	// 	return this.#createFromData("registerMultisignature", {
	// 		...input,
	// 		data: {
	// 			keysgroup: input.data.mandatoryKeys,
	// 			lifetime: input.data.lifetime,
	// 			minimum: input.data.numberOfSignatures,
	// 		},
	// 	});
	// }

	async #createFromData(
		type: string,
		input: Contracts.KeyValuePair,
		callback?: Function,
	): Promise<Contracts.SignedTransactionData> {
		try {
			const struct: Contracts.KeyValuePair = { ...input.data };

			struct.networkIdentifier = this.configRepository.get<string>("network.meta.networkId");

			if (callback) {
				callback({ struct });
			}

			const transactionSigner = {
				transfer,
				registerSecondPassphrase,
				registerDelegate,
				castVotes,
				registerMultisignature,
			}[type]!;

			if (input.signatory.actsWithLedger()) {
				await this.ledgerService.connect(LedgerTransportNodeHID);

				const structTransaction = transactionSigner(struct as any) as unknown as TransactionJSON;
				// @ts-ignore - LSK uses JS so they don't encounter these type errors
				structTransaction.senderPublicKey = await this.ledgerService.getPublicKey(input.signatory.signingKey());

				if (!structTransaction.recipientId) {
					// @ts-ignore - LSK uses JS so they don't encounter these type errors
					structTransaction.recipientId = (
						await this.addressService.fromPublicKey(structTransaction.senderPublicKey)
					).address;
				}

				// @ts-ignore - LSK uses JS so they don't encounter these type errors
				structTransaction.signature = await this.ledgerService.signTransaction(
					input.signatory.signingKey(),
					utils.getTransactionBytes(structTransaction),
				);
				// @ts-ignore - LSK uses JS so they don't encounter these type errors
				structTransaction.id = utils.getTransactionId(structTransaction as any);

				await this.ledgerService.disconnect();

				return this.dataTransferObjectService.signedTransaction(structTransaction.id, structTransaction);
			}

			if (input.signatory.signingKey()) {
				struct.passphrase = input.signatory.signingKey();
			}

			if (input.signatory.actsWithSecondaryMnemonic()) {
				struct.secondPassphrase = input.signatory.confirmKey();
			}

			const signedTransaction: any = transactionSigner(struct as any);

			return this.dataTransferObjectService.signedTransaction(signedTransaction.id, signedTransaction);
		} catch (error) {
			throw new Exceptions.CryptoException(error);
		}
	}
}
