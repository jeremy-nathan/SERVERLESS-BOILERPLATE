import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { BaseReqModel } from '../../common/common.dto';

@Exclude()
export class CreateBankReq extends BaseReqModel {
	@IsString()
	@Expose()
	id: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	name: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	swift: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	mainBranch: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	countryIso: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	requestId: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	status: string;
}

export class UpdateBankReq extends BaseReqModel {
	@IsString()
	@Expose()
	name: string;

	@IsString()
	@Expose()
	swift: string;

	@IsString()
	@Expose()
	countryIso: string;

	@IsString()
	@Expose()
	status: string;

	@IsString()
	@Expose()
	approvalStatus: string;
}

export class CreateBankBranchReq extends BaseReqModel {
	@IsNotEmpty()
	@IsString()
	@Expose()
	swift: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	branch_swift: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	branch_name: string;

	@IsNotEmpty()
	@IsString()
	@Expose()
	country_iso: string;
}
