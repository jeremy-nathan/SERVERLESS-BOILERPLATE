import * as express from 'express';

export interface Request<TBody> extends express.Request<any, any, TBody, any> {
	validatedBody?: TBody;
	[key: string]: any;
}

export interface Response extends express.Response {
	[key: string]: any;
}
