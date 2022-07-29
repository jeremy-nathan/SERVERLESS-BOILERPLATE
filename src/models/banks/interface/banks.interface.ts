import { Document } from 'dynamoose/dist/Document';

import { IModel, IReqModel } from '../../common/common.interface';

export interface IBankCreationReq extends IReqModel {
	id?: string;
	swift?: string;
	name?: string;
	countryIso?: string;
	requestId?: string;
	mainBranch?: string;
	status?: string;
}

export interface IBankUpdateReq extends IReqModel {
	name?: string;
	swift?: string;
	countryIso?: string;
	status?: string;
	approvalStatus?: string;
}

export interface IMMTBankCreationReq extends IReqModel {
	id?: string;
	identifier?: string;
	name?: string;
}

export interface IBankBranchCreationReq extends IReqModel {
	swift?: string;
	branch_swift?: string;
	name?: string;
	country_iso?: string;
	status?: string;
}

export interface IBanksRes extends IBankCreationReq, IBankUpdateReq {}
export interface IBanksModel extends IBanksRes, Document, IModel {}
export interface IMMTBanksModel {}
