import { IoC, Services } from "@payvo/sdk";
import Bitcoin from "@ledgerhq/hw-app-btc";
import { getAppAndVersion } from "@ledgerhq/hw-app-btc/lib/getAppAndVersion";
import { serializeTransactionOutputs } from "@ledgerhq/hw-app-btc/lib/serializeTransaction";

@IoC.injectable()
export class LedgerService extends Services.AbstractLedgerService {
	#ledger: Services.LedgerTransport;
	#transport!: Bitcoin;

	public override async connect(transport: Services.LedgerTransport): Promise<void> {
		this.#ledger = await transport.create();
		this.#transport = new Bitcoin(this.#ledger);
	}

	public override async disconnect(): Promise<void> {
		await this.#ledger.close();
	}

	public override async getVersion(): Promise<string> {
		const { version } = await getAppAndVersion(this.#ledger);

		return version;
	}

	public override async getPublicKey(path: string): Promise<string> {
		const { publicKey } = await this.#transport.getWalletPublicKey(path);

		return publicKey;
	}

	public override async signTransaction(path: string, payload: Buffer): Promise<string> {
		const tx = await this.#transport.splitTransaction(payload.toString());
		const utxoPath = path.match(new RegExp("([0-9]+'?/?){3}$", "g"));
		const outputScript = serializeTransactionOutputs(tx).toString("hex");

		const signature = await this.#transport.createPaymentTransactionNew({
			inputs: [[tx, 1]],
			associatedKeysets: utxoPath,
			outputScriptHex: outputScript,
		});

		return signature.toString();
	}

	public override async signMessage(path: string, payload: Buffer): Promise<string> {
		const signature = await this.#transport.signMessageNew(path, payload.toString("hex"));

		return JSON.stringify(signature);
	}
}
