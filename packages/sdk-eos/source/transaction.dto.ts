import { Contracts, DTO, IoC } from "@payvo/sdk";
import { DateTime } from "@payvo/intl";
import { BigNumber } from "@payvo/helpers";

@IoC.injectable()
export class ConfirmedTransactionData extends DTO.AbstractConfirmedTransactionData {
	public override id(): string {
		return this.data.hash;
	}

	public override blockId(): string | undefined {
		return undefined;
	}

	public override timestamp(): DateTime | undefined {
		return undefined;
	}

	public override confirmations(): BigNumber {
		return BigNumber.ZERO;
	}

	public override sender(): string {
		return this.data.from;
	}

	public override recipient(): string {
		return this.data.to;
	}

	public override amount(): BigNumber {
		return this.bigNumberService.make(this.data.value);
	}

	public override fee(): BigNumber {
		return this.bigNumberService.make(this.data.gas);
	}

	public override memo(): string | undefined {
		return this.data.data;
	}
}
