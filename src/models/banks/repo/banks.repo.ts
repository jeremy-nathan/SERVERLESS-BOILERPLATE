import autoBind from 'auto-bind';

import dynamoose from '../../../aws/dynamodb/database';
import { handleRepoError } from '../../../utils/handler';
import { IBankCreationReq, IBanksModel, IBankUpdateReq } from '../interface/banks.interface';
import { BankSchema } from '../schemas/banks.schema';

import type { ModelType } from 'dynamoose/dist/General';

export default class BanksRespository {
	private BanksModel: ModelType<IBanksModel>;

	constructor() {
		this.BanksModel = dynamoose.model<IBanksModel>('Bank', BankSchema);
		autoBind(this);
	}

	public async createBank(param: IBankCreationReq): Promise<IBanksModel> {
		try {
			const model = await this.BanksModel.create(param);
			return model;
		} catch (error) {
			handleRepoError(this.createBank, error, true);
		}
	}

	public async getBanks(): Promise<IBanksModel[]> {
		try {
			const banks = await this.BanksModel.scan().all().exec();
			return banks;
		} catch (error) {
			handleRepoError(this.getBanks, error);
		}
	}

	public async getBankById(swift: string): Promise<IBanksModel[]> {
		try {
			const banks = await this.BanksModel.query({ identifier: swift }).using('identifierGlobalIndex').exec();
			return banks;
		} catch (error) {
			handleRepoError(this.getBankById, error);
		}
	}

	public async updateBank(param: IBankUpdateReq): Promise<IBanksModel> {
		try {
			const bank = await this.BanksModel.update(param);
			return bank;
		} catch (error) {
			handleRepoError(this.updateBank, error);
		}
	}
}
