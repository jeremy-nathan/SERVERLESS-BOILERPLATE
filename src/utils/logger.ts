import config from 'config';
import { NextFunction } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import pinoPretty from 'pino-pretty';

import { getCurrentInvoke } from '@vendia/serverless-express';

import { Request, Response } from '../models/http.interface';
import { getEnvStage, stringify, tryParseJsonString } from './helper';

export const isLocal = config.get<boolean>('isLocal');
export const isDebug = config.get<boolean>('isDebug');
export const isXRayEnabled = config.get<boolean>('xRay');

export enum LogLevel {
	TRACE = 'trace',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	FATAL = 'fatal',
	SILENT = 'silent',
}

const defaultRedacts = [
	'req.body.password',
	'req.headers.Authorization',
	'req.headers.authorization',
	'req.query.token',
	'res.body.id_token',
	'res.body.access_token',
	'res.body.refresh_token',
];

export default class Logger {
	public instance: pino.Logger;

	constructor(loggerName: string, level = LogLevel.INFO, redactPaths?: string[]) {
		const options: pino.LoggerOptions = {
			name: loggerName,
			timestamp: pino.stdTimeFunctions.isoTime,
			level,
			redact: getEnvStage() === 'prod' ? (redactPaths ? [...redactPaths, ...defaultRedacts] : defaultRedacts) : undefined,
			messageKey: 'message',
		};
		this.instance = pino(
			options,
			isLocal
				? pinoPretty({
						colorize: true,
						levelFirst: true,
						translateTime: true,
						sync: true,
				  })
				: undefined,
		);
	}

	log(event: any) {
		this.debug(null, event);
	}

	trace(message: string, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.trace({ requestId: context ? context.awsRequestId : '', data }, message);
		}
	}

	debug(message: string, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.debug({ requestId: context ? context.awsRequestId : '', data }, message);
		}
	}

	info(message: string, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.info({ requestId: context ? context.awsRequestId : '', data }, message);
		}
	}

	warn(message: string, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.warn({ requestId: context ? context.awsRequestId : '', data }, message);
		}
	}

	error(message: string, errorObj?: any | Error, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.error(
				{
					requestId: context ? context.awsRequestId : '',
					error: errorObj instanceof Error ? stringify(errorObj, Object.getOwnPropertyNames(errorObj)) : errorObj,
					data,
				},
				message,
			);
		}
	}

	fatal(message: string, errorObj?: any | Error, data?: any | Error) {
		if (this.instance.isLevelEnabled(this.instance.level)) {
			const { context } = getCurrentInvoke();
			this.instance.fatal(
				{
					requestId: context ? context.awsRequestId : '',
					error: errorObj instanceof Error ? stringify(errorObj, Object.getOwnPropertyNames(errorObj)) : errorObj,
					data,
				},
				message,
			);
		}
	}
}

export function setResponseBody(req: Request<any> | any, res: Response | any, next: NextFunction) {
	const rawResponse = res.write;
	const rawResponseEnd = res.end;
	if (rawResponse && rawResponseEnd) {
		const chunks = [];
		res.write = (...restArgs) => {
			chunks.push(Buffer.from(restArgs[0]));
			rawResponse.apply(res, restArgs);
			return true;
		};

		res.end = (...restArgs) => {
			if (restArgs[0]) {
				chunks.push(Buffer.from(restArgs[0]));
			}
			const body = Buffer.concat(chunks).toString('utf8');

			const resHeaders = res.getHeaders();
			const contentType = `${resHeaders['content-type']}`;
			if (contentType && contentType.indexOf('application/json') >= 0) {
				res.body = tryParseJsonString(body);
			} else {
				res.body = contentType;
			}
			rawResponseEnd.apply(res, restArgs);
		};

		if (next) {
			next();
		}
	}
}

export const HTTPLogger = pinoHttp({
	logger: new Logger('app:http').instance,
	quietReqLogger: true,
	genReqId: (req: any) => {
		const { context } = getCurrentInvoke();
		return context.awsRequestId;
	},
	serializers: {
		err: (err) => err.message,
		req: (req: Request<any>) => {
			req.params = req.raw.params;
			req.query = req.raw.query;
			req.body = req.raw.body;

			if (!isLocal) {
				const { event } = getCurrentInvoke();
				req.requestContext = event.requestContext;
			}

			return req;
		},
		res: (res) => {
			res.body = res.raw.body;
			return res;
		},
	},
	customAttributeKeys: { err: 'errorMessage' },
});

export const DatabaseLogger = new Logger('aws:database', isDebug ? LogLevel.DEBUG : LogLevel.SILENT);
export const ErrorLogger = new Logger('app:exception', LogLevel.ERROR);
export const XRayLogger = new Logger('aws:xray', isXRayEnabled ? LogLevel.ERROR : LogLevel.SILENT);
