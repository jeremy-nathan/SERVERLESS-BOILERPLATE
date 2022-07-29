import dynamoose from '../../../aws/dynamodb/database';

export const BankSchema = new dynamoose.Schema(
	{
		swift: {
			type: String,
			hashKey: true,
		},
		countryIso: {
			type: String,
			index: [
				{
					global: true,
					name: 'countryIsoStatusGI',
					rangeKey: 'status',
				},
			],
		},
		name: {
			type: String,
			required: true,
		},
		requestId: {
			type: String,
		},
		status: {
			type: String,
			default: '1',
			index: [
				{
					global: true,
					name: 'statusCreatedAtGI',
					rangeKey: 'createdAt',
				},
			],
		},
		approvalStatus: {
			type: String,
			default: 'APPROVED',
			index: [
				{
					global: true,
					name: 'approvalStatusCreatedAtGI',
					rangeKey: 'createdAt',
				},
			],
		},
		mainBranch: {
			type: String,
			required: true,
			rangeKey: true,
			index: [
				{
					global: true,
					name: 'mainBranchStatusGI',
					rangeKey: 'status',
				},
			],
		},
	},
	{
		timestamps: true,
	},
);
