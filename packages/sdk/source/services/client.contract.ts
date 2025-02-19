import { ConfirmedTransactionDataCollection, WalletDataCollection } from "../collections";
import { KeyValuePair, SignedTransactionData, WalletData } from "../contracts";
import { ConfirmedTransactionData } from "../dto/confirmed-transaction.contract";

export type ClientPaginatorCursor = string | number | undefined;

export interface MetaPagination {
	prev: ClientPaginatorCursor;
	self: ClientPaginatorCursor;
	next: ClientPaginatorCursor;
	last: ClientPaginatorCursor;
}

export interface BroadcastResponse {
	accepted: string[];
	rejected: string[];
	errors: Record<string, string>;
}

export interface ClientService {
	transaction(id: string): Promise<ConfirmedTransactionData>;
	transactions(query: ClientTransactionsInput): Promise<ConfirmedTransactionDataCollection>;

	wallet(id: string): Promise<WalletData>;
	wallets(query: ClientWalletsInput): Promise<WalletDataCollection>;

	delegate(id: string): Promise<WalletData>;
	delegates(query?: ClientWalletsInput): Promise<WalletDataCollection>;

	votes(id: string): Promise<VoteReport>;
	// TODO: return struct like VoteReport
	voters(id: string, query?: KeyValuePair): Promise<WalletDataCollection>;

	broadcast(transactions: SignedTransactionData[]): Promise<BroadcastResponse>;
}

export interface ClientPagination {
	cursor?: string | number;
	limit?: number;
	orderBy?: string;
}

export interface ClientTransactionsInput extends ClientPagination {
	// Addresses
	address?: string;
	addresses?: string[];
	senderId?: string;
	recipientId?: string;
	walletId?: string;
	// Public Keys
	senderPublicKey?: string;
	recipientPublicKey?: string;
	// Meta
	asset?: Record<string, any>;
	memo?: string;
	// Transaction Types
	type?: number;
	typeGroup?: number;
}

export interface ClientWalletsInput extends ClientPagination {
	address?: string;
	addresses?: string[];
	publicKey?: string;
	username?: string;
}

// TODO: move
export interface VoteReport {
	used: number;
	available: number;
	votes: { id: string; amount: number }[];
}

export interface TransactionDetailInput {
	walletId?: string;
}
