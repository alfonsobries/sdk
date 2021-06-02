import { Coins, Contracts, Helpers, Services } from "@arkecosystem/platform-sdk";
import Stellar from "stellar-sdk";

import { WalletData } from "../dto";
import * as TransactionDTO from "../dto";

export class ClientService extends Services.AbstractClientService {
	readonly #client;

	readonly #broadcastErrors: Record<string, string> = {
		op_malformed: "ERR_MALFORMED",
		op_underfunded: "ERR_INSUFFICIENT_FUNDS",
		op_low_reserve: "ERR_LOW_RESERVE",
		op_line_full: "ERR_LINE_FULL",
		op_no_issuer: "ERR_NO_ISSUER",
	};

	private constructor(network: string) {
		super();

		this.#client = new Stellar.Server(
			{ mainnet: "https://horizon.stellar.org", testnet: "https://horizon-testnet.stellar.org" }[
				network.split(".")[1]
			],
		);
	}

	public static async __construct(config: Coins.Config): Promise<ClientService> {
		return new ClientService(config.get<Coins.NetworkManifest>("network").id);
	}

	public async transaction(
		id: string,
		input?: Contracts.TransactionDetailInput,
	): Promise<Contracts.TransactionDataType> {
		const transaction = await this.#client.transactions().transaction(id).call();
		const operations = await transaction.operations();

		return Helpers.createTransactionDataWithType(
			{
				...transaction,
				...{ operation: operations.records[0] },
			},
			TransactionDTO,
		);
	}

	public async transactions(query: Contracts.ClientTransactionsInput): Promise<Coins.TransactionDataCollection> {
		const { records, next, prev } = await this.#client.payments().forAccount(query.address).call();

		return Helpers.createTransactionDataCollectionWithType(
			records.filter((transaction) => transaction.type === "payment"),
			{
				prev,
				self: undefined,
				next,
				last: undefined,
			},
			TransactionDTO,
		);
	}

	public async wallet(id: string): Promise<Contracts.WalletData> {
		return new WalletData(await this.#client.loadAccount(id));
	}

	public async broadcast(transactions: Contracts.SignedTransactionData[]): Promise<Contracts.BroadcastResponse> {
		const result: Contracts.BroadcastResponse = {
			accepted: [],
			rejected: [],
			errors: {},
		};

		for (const transaction of transactions) {
			try {
				const { id } = await this.#client.submitTransaction(transaction.toBroadcast());

				transaction.setAttributes({ identifier: id });

				result.accepted.push(id);
			} catch (err) {
				const { extras } = err.response.data;
				result.rejected.push(transaction.id());

				if (!Array.isArray(result.errors[transaction.id()])) {
					result.errors[transaction.id()] = [];
				}

				for (const [key, value] of Object.entries(this.#broadcastErrors)) {
					for (const operation of extras.result_codes.operations) {
						if (operation.includes(key)) {
							result.errors[transaction.id()].push(value);
						}
					}
				}
			}
		}

		return result;
	}
}
