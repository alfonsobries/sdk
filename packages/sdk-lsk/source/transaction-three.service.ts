import { Contracts, IoC, Services } from "@payvo/sdk";
import { convertLSKToBeddows, signTransaction, signMultiSignatureTransaction } from "@liskhq/lisk-transactions-beta";
import { convertBuffer, convertBufferList, convertString, convertStringList } from "@payvo/helpers";
import { DateTime } from "@payvo/intl";
import { TransactionSerializer } from "./transaction.serializer";
import { BindingType } from "./coin.contract";
import { AssetSerializer } from "./asset.serializer";

@IoC.injectable()
export class TransactionService extends Services.AbstractTransactionService {
	@IoC.inject(IoC.BindingType.MultiSignatureService)
	private readonly multiSignatureService!: Services.MultiSignatureService;

	@IoC.inject(IoC.BindingType.FeeService)
	private readonly feeService!: Services.FeeService;

	@IoC.inject(BindingType.AssetSerializer)
	protected readonly assetSerializer!: AssetSerializer;

	@IoC.inject(BindingType.TransactionSerializer)
	protected readonly transactionSerializer!: TransactionSerializer;

	public override async transfer(input: Services.TransferInput): Promise<Contracts.SignedTransactionData> {
		return this.#createFromData(
			"token:transfer",
			{
				amount: this.toSatoshi(input.data.amount).toString(),
				recipientAddress: input.data.to,
				data: input.data.memo,
			},
			input,
		);
	}

	public override async delegateRegistration(
		input: Services.DelegateRegistrationInput,
	): Promise<Contracts.SignedTransactionData> {
		return this.#createFromData(
			"dpos:registerDelegate",
			{
				username: input.data.username,
			},
			input,
		);
	}

	public override async vote(input: Services.VoteInput): Promise<Contracts.SignedTransactionData> {
		const votes: {
			delegateAddress: string;
			amount: number;
		}[] = [];

		if (Array.isArray(input.data.votes)) {
			for (const vote of input.data.votes) {
				votes.push({
					delegateAddress: vote.id,
					amount: vote.amount,
				});
			}
		}

		if (Array.isArray(input.data.unvotes)) {
			for (const unvote of input.data.unvotes) {
				votes.push({
					delegateAddress: unvote.id,
					amount: unvote.amount,
				});
			}
		}

		return this.#createFromData("dpos:voteDelegate", { votes }, input);
	}

	public override async multiSignature(
		input: Services.MultiSignatureInput,
	): Promise<Contracts.SignedTransactionData> {
		if (!Array.isArray(input.data.mandatoryKeys)) {
			throw new Error("Expected [input.data.mandatoryKeys] to be defined as a list of strings.");
		}

		if (!Array.isArray(input.data.optionalKeys)) {
			throw new Error("Expected [input.data.optionalKeys] to be defined as a list of strings.");
		}

		return this.#createFromData(
			"keys:registerMultisignatureGroup",
			{
				numberOfSignatures: input.data.numberOfSignatures,
				mandatoryKeys: input.data.mandatoryKeys.slice(0, input.data.min),
				optionalKeys: input.data.optionalKeys.slice(input.data.min),
			},
			input,
		);
	}

	async #createFromData(
		type: string,
		asset: Record<string, any>,
		input: Services.TransactionInput,
	): Promise<Contracts.SignedTransactionData> {
		let signedTransaction: any;
		let wallet: Contracts.WalletData | undefined;

		try {
			wallet = await this.clientService.wallet(input.signatory.address());
		} catch {
			//
		}

		const { assetSchema, moduleAssetId } = this.configRepository.get<object>("network.meta.assets")[type];

		const isMultiSignatureRegistration = moduleAssetId === "4:0";

		if (wallet?.isMultiSignature() || isMultiSignatureRegistration) {
			return this.#handleMultiSignature({
				asset,
				assetSchema,
				isMultiSignatureRegistration,
				input,
				type,
				wallet,
			});
		}

		const transactionObject = await this.#buildTransactionObject(input, type, input.fee);

		signedTransaction = signTransaction(
			assetSchema,
			await this.#computeMinFee(input, {
				...transactionObject,
				asset: this.assetSerializer.toMachine(transactionObject.moduleID, transactionObject.assetID, asset),
			}),
			this.#networkIdentifier(),
			input.signatory.signingKey(),
		);

		if (input.signatory.actsWithSecondaryMnemonic()) {
			signedTransaction = await this.multiSignatureService.addSignature(signedTransaction, input.signatory);
		}

		return this.dataTransferObjectService.signedTransaction(convertBuffer(signedTransaction.id), {
			...this.transactionSerializer.toHuman(signedTransaction),
			timestamp: DateTime.make(),
		});
	}

	async #handleMultiSignature({
		asset,
		assetSchema,
		isMultiSignatureRegistration,
		input,
		type,
		wallet,
	}): Promise<Contracts.SignedTransactionData> {
		const numberOfSignatures: number = isMultiSignatureRegistration
			? asset.numberOfSignatures
			: wallet?.multiSignature().numberOfSignatures;

		const keys = {
			mandatoryKeys: convertStringList(
				isMultiSignatureRegistration ? asset.mandatoryKeys : wallet?.multiSignature().mandatoryKeys,
			),
			optionalKeys: convertStringList(
				isMultiSignatureRegistration ? asset.optionalKeys : wallet?.multiSignature().optionalKeys,
			),
		};

		const transactionObject = await this.#buildTransactionObject(input, type, input.fee);

		let signedTransaction: any = signMultiSignatureTransaction(
			assetSchema,
			await this.#computeMinFee(input, {
				...transactionObject,
				asset: this.assetSerializer.toMachine(transactionObject.moduleID, transactionObject.assetID, asset),
				signatures: [],
			}),
			this.#networkIdentifier(),
			input.signatory.signingKey(),
			keys,
			isMultiSignatureRegistration,
		);

		const needsDoubleSign = [
			...convertBufferList(keys.mandatoryKeys ?? []),
			...convertBufferList(keys.optionalKeys ?? []),
		].includes(input.signatory.publicKey());

		if (isMultiSignatureRegistration && needsDoubleSign) {
			signedTransaction = signMultiSignatureTransaction(
				assetSchema,
				{
					...(await this.#buildTransactionObject(input, type, signedTransaction.fee)),
					asset: signedTransaction.asset,
					signatures: signedTransaction.signatures,
				},
				this.#networkIdentifier(),
				input.signatory.signingKey(),
				keys,
				isMultiSignatureRegistration,
			);
		}

		return this.dataTransferObjectService.signedTransaction(convertBuffer(signedTransaction.id), {
			...this.transactionSerializer.toHuman(signedTransaction, keys),
			multiSignature: this.#multiSignatureAsset({
				isMultiSignatureRegistration,
				numberOfSignatures,
				keys,
				wallet,
			}),
			timestamp: DateTime.make(),
		});
	}

	#multiSignatureAsset({ isMultiSignatureRegistration, numberOfSignatures, keys, wallet }): object {
		if (isMultiSignatureRegistration) {
			return {
				numberOfSignatures,
				mandatoryKeys: convertBufferList(keys.mandatoryKeys),
				optionalKeys: convertBufferList(keys.optionalKeys),
			};
		}

		const result = wallet.multiSignature();
		delete result.members;

		return result;
	}

	#assets(): object {
		return this.configRepository.get<object>("network.meta.assets");
	}

	#networkIdentifier(): Buffer {
		return convertString(this.configRepository.get<string>("network.meta.networkId"));
	}

	#senderPublicKey(input: Services.TransactionInput): Buffer {
		return convertString(input.signatory.publicKey());
	}

	async #buildTransactionObject(
		input: Services.TransactionInput,
		type: string,
		fee?: number,
	): Promise<Record<string, any>> {
		let nonce: BigInt | undefined = undefined;

		try {
			const wallet: Contracts.WalletData = await this.clientService.wallet(input.signatory.address());

			nonce = BigInt(wallet.nonce().toString());
		} catch {
			nonce = BigInt(0);
		}

		const { assetID, moduleID } = this.#assets()[type];

		return {
			moduleID,
			assetID,
			fee: typeof fee === "bigint" ? fee : BigInt(convertLSKToBeddows(`${fee ?? 0}`)),
			nonce,
			senderPublicKey: this.#senderPublicKey(input),
		};
	}

	async #computeMinFee(
		input: Services.TransactionInput,
		transaction: Contracts.RawTransactionData,
	): Promise<Record<string, any>> {
		let fee: number;

		if (input.fee && Number.isInteger(input.fee)) {
			fee = input.fee;
		} else {
			fee = await this.feeService.calculate(transaction);
		}

		return {
			...transaction,
			fee: BigInt(convertLSKToBeddows(`${fee}`)),
		};
	}
}
