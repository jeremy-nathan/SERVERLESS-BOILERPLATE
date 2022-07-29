import { ClassTransformOptions } from 'class-transformer';
import { QueryResponse } from 'dynamoose/dist/DocumentRetriever';

export interface IReqModel {
	toPlain<T>(opts?: ClassTransformOptions | { exposeUnsetFields: false }): T;
}

export interface IModel {
	expires?: Date | number;
	updatedAt?: Date;
	createdAt?: Date;
}

export enum FileExtensionType {
	JPG = 'jpg',
	JPEG = 'jpeg',
	PNG = 'png',
	PDF = 'pdf',
}

export interface IDynamoDBType {
	N?: string;
	S?: string;
}

export interface IDynamoDBImage {
	[key: string]: IDynamoDBType;
}

export interface IQueryResponseModel<T> extends QueryResponse<T> {
	nextToken?: string;
}

export interface IIndexResponse {
	total: number;
}
