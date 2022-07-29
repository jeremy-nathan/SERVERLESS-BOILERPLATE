import autoBind from 'auto-bind';

import { Request, Response } from '../../models/http.interface';
import { BanksAPI } from '../../services';
import BanksService from '../../services/banks/banks.service';
import { handleControllerError } from '../../utils/handler';

export default class BanksController {
	private BanksService: BanksService;

	constructor() {
		this.BanksService = BanksAPI;
		autoBind(this);
	}

	public async updateBank(req: Request<any>, res: Response) {
		try {
			const result = await this.BanksService.updateBank(req.body);
			res.json(result.serialize());
		} catch (error) {
			handleControllerError(error, res);
		}
	}
}
