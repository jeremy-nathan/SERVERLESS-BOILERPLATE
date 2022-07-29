import autoBind from 'auto-bind';

import { IBanksModel, IBankUpdateReq } from '../../models/banks/interface/banks.interface';
import BanksRespository from '../../models/banks/repo/banks.repo';
import { handleServiceError } from '../../utils/handler';
import Logger from '../../utils/logger';

export default class BanksService {
	private logger: Logger;
	private BanksRepo: BanksRespository;

	constructor() {
		this.BanksRepo = new BanksRespository();
		autoBind(this);
	}

	public async updateBank(params: IBankUpdateReq): Promise<IBanksModel> {
		try {
			const result = await this.BanksRepo.updateBank(params);

			return result;
		} catch (error) {
			handleServiceError(this.updateBank, error);
		}
	}
}
