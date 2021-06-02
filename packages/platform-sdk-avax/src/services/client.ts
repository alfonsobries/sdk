import { Coins, Contracts, Helpers, Services } from "@arkecosystem/platform-sdk";
import { uniq } from "@arkecosystem/utils";
import { AVMAPI, Tx } from "avalanche/dist/apis/avm";
import { PlatformVMAPI } from "avalanche/dist/apis/platformvm";

import { TransactionData, WalletData } from "../dto";
import * as TransactionDTO from "../dto";
import { cb58Decode, usePChain, useXChain } from "./helpers";

export class ClientService extends Services.AbstractClientService {
	readonly #config: Coins.Config;
	readonly #xchain: AVMAPI;
	readonly #pchain: PlatformVMAPI;

	private constructor(config: Coins.Config) {
		super();

		this.#config = config;
		this.#xchain = useXChain(config);
		this.#pchain = usePChain(config);
	}

	public static async __construct(config: Coins.Config): Promise<ClientService> {
		return new ClientService(config);
	}

	public async transaction(
		id: string,
		input?: Contracts.TransactionDetailInput,
	): Promise<Contracts.TransactionDataType> {
		const transaction = new Tx();
		transaction.fromString(await this.#xchain.getTx(id));

		const unsignedTransaction = transaction.getUnsignedTx();
		const baseTransaction = unsignedTransaction.getTransaction();

		const assetId = cb58Decode(this.#config.get("network.meta.assetId"));

		return new TransactionData({
			id,
			amount: unsignedTransaction.getOutputTotal(assetId).toString(),
			fee: unsignedTransaction.getBurn(assetId).toString(),
			memo: baseTransaction.getMemo().toString("utf-8"),
		});
	}

	public async transactions(query: Contracts.ClientTransactionsInput): Promise<Coins.TransactionDataCollection> {
		const { transactions } = await this.get("v2/transactions", {
			chainID: this.#config.get("network.meta.blockchainId"),
			limit: 100,
			offset: query.cursor || 0,
			address: query.address,
		});

		return Helpers.createTransactionDataCollectionWithType(
			transactions,
			{
				prev: undefined,
				self: undefined,
				next: undefined,
				last: undefined,
			},
			TransactionDTO,
		);
	}

	public async wallet(id: string): Promise<Contracts.WalletData> {
		const { balance }: any = await this.#xchain.getBalance(id, this.#config.get("network.meta.assetId"));

		return new WalletData({
			address: id,
			balance: balance,
		});
	}

	public async delegates(query?: Contracts.KeyValuePair): Promise<Coins.WalletDataCollection> {
		const validators: string[] = await this.#pchain.sampleValidators(10000);

		return new Coins.WalletDataCollection(
			uniq(validators).map((validator: string) => new WalletData({ address: validator, balance: 0 })),
			{
				prev: undefined,
				self: undefined,
				next: undefined,
				last: undefined,
			},
		);
	}

	public async broadcast(transactions: Contracts.SignedTransactionData[]): Promise<Contracts.BroadcastResponse> {
		const result: Contracts.BroadcastResponse = {
			accepted: [],
			rejected: [],
			errors: {},
		};

		for (const transaction of transactions) {
			try {
				const hash: string = await this.#xchain.issueTx(transaction.toBroadcast());

				transaction.setAttributes({ identifier: hash });

				result.accepted.push(hash);
			} catch (error) {
				result.rejected.push(transaction.id());

				result.errors[transaction.id()] = error.message;
			}
		}

		return result;
	}

	private async get(path: string, query?: Contracts.KeyValuePair): Promise<Contracts.KeyValuePair> {
		return (
			await this.#config
				.get<Contracts.HttpClient>(Coins.ConfigKey.HttpClient)
				.get(`${this.host()}/${path}`, query?.searchParams)
		).json();
	}

	private host(): string {
		return Helpers.randomHostFromConfig(this.#config, "archival");
	}
}
