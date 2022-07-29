import bcrypt from 'bcryptjs';
import { formatISO } from 'date-fns';
import { Response } from 'express';
import safeStringify from 'fast-safe-stringify';
import * as jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import mime from 'mime-types';
import { customRandom, random } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { createHmac } from 'node:crypto';
import path from 'node:path';
import short from 'short-uuid';
import getUuid from 'uuid-by-string';

import { getCurrentInvoke } from '@vendia/serverless-express';

import { FileExtensionType, IQueryResponseModel } from '../models/common/common.interface';
import { TokenExpiredError, TokenInvalidError } from '../models/errors/auth.error';
import * as config from './config';
import { HttpStatus } from './error';

import type { Query } from 'dynamoose/dist/DocumentRetriever';
import type { ModelType } from 'dynamoose/dist/General';

export async function lazyQuery<T>(
	queryFunc: Query<T>,
	indexName?: string,
	limit = 5,
	nextToken?: string,
	attributes?: string[],
): Promise<IQueryResponseModel<T>> {
	if (indexName) {
		queryFunc.using(indexName);
	}

	if (attributes?.length > 0) {
		queryFunc.attributes(attributes);
	}

	if (limit > 0) {
		queryFunc.limit(limit);
	}

	const results: IQueryResponseModel<T> = nextToken
		? await queryFunc.startAt(tryParseJsonString(Buffer.from(nextToken, 'base64').toString('utf-8'))).exec()
		: await queryFunc.exec();

	while (results.length < limit && results.lastKey) {
		queryFunc.limit(limit - results.length);
		const tempResults = await queryFunc.startAt(results.lastKey).exec();
		if (tempResults.length > 0) {
			results.push(...tempResults);
		}
		results.lastKey = tempResults.lastKey;
	}

	if (results.length > 0 && results.lastKey) {
		results.nextToken = encodeURIComponent(Buffer.from(stringify(results.lastKey)).toString('base64'));
	}

	return results;
}

export function setDateTimeSerializer(...models: ModelType<any>[]) {
	models.map((model) => {
		model.serializer.add('dateSerializer', {
			modify: dateTimeSerializer,
		});
		model.serializer.default.set('dateSerializer');
	});
}

export function dateTimeSerializer(serialized: any, original: any) {
	const serializedObj: any = {
		...serialized,
	};

	const dates = ['createdAt', 'updatedAt', 'expires', 'expireDate', 'startDate', 'endDate'];

	dates.map((date) => {
		if (original[date]) {
			serializedObj[date] =
				typeof original[date] === 'string'
					? getISOTime(new Date(original[date]))
					: date === 'expires' && typeof original[date] === 'number'
					? getISOTime(original[date] * 1000)
					: getISOTime(original[date]);
		}
	});

	return serializedObj;
}

export function hmac256(data: string, secret: string, encodingType: 'base64' | 'hex' = 'hex'): string {
	const hmac = createHmac('sha256', secret);
	return hmac.update(data).digest(encodingType);
}

export function hashPassword(password: string, salt = 10): string {
	return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, passwordHash: string): boolean {
	return bcrypt.compareSync(password, passwordHash);
}

export function removeUrlParam(key: string, sourceURL: string): string {
	let newUrl = sourceURL.split('?')[0],
		param,
		params_arr = [];

	const queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
	if (queryString !== '') {
		params_arr = queryString.split('&');
		for (let i = params_arr.length - 1; i >= 0; i -= 1) {
			param = params_arr[i].split('=')[0];
			if (param === key) {
				params_arr.splice(i, 1);
			}
		}
		newUrl = newUrl + '?' + params_arr.join('&');
	}
	return newUrl;
}

export function verifySupportedFileExt(fileExt: string, isProfilePic = false) {
	switch (fileExt.replace('.', '').toLowerCase()) {
		case FileExtensionType.JPG:
		case FileExtensionType.JPEG:
		case FileExtensionType.PNG:
			return true;
		case FileExtensionType.PDF:
			return isProfilePic ? false : true;
		default:
			return false;
	}
}

export function getFileContentType(fileExt: string) {
	return mime.lookup(fileExt);
}

export function getFileExtensionFromPath(filePath: string) {
	const { ext } = path.parse(filePath);
	return ext.toLowerCase();
}

export function getFileExtensionFromUrl(url: string) {
	let ext: string;
	if (url.includes('?')) {
		const urlOnly = url.split('?')[0];
		ext = urlOnly.substring(urlOnly.lastIndexOf('.') + 1);
	} else {
		ext = url.substring(url.lastIndexOf('.') + 1);
	}
	return ext;
}

export function getISOTime(dateTime: Date | number) {
	return formatISO(dateTime);
}

export function calDiffDays(before: Date, after?: Date) {
	const now = after ? after : new Date();
	return (now.getTime() - before.getTime()) / (1000 * 3600 * 24);
}

export function stringify(json: any, replacer?: any): string {
	return safeStringify(json, replacer);
}

export function tryParseJsonString(str: string) {
	try {
		const jsonObj = JSON.parse(str);
		return jsonObj;
	} catch (error) {
		return str;
	}
}

export function sortObjectByKeys(o: any) {
	return Object.keys(o)
		.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
		.reduce((r, k) => ((r[k] = o[k]), r), {});
}

export function getUUIDByString(value: string, isShort = false, customAlphabet = alphanumeric) {
	const guid = getUuid(value);
	return isShort ? short(customAlphabet).fromUUID(guid) : guid;
}

export function getShortId(length = 21, customAlphabet = alphanumeric) {
	const nanoid = customRandom(customAlphabet, length, random);
	return nanoid();
}

export function getUUID(isGUID = false) {
	return isGUID ? short.uuid() : short.generate();
}

export function getHost(withStage = false) {
	const { event } = getCurrentInvoke();
	const protocol = event && event.headers['x-forwarded-proto'] ? event.headers['x-forwarded-proto'] : 'http';

	let url = `${protocol}://${event.headers.host}`;
	if (withStage && event.requestContext.stage) {
		const stage = event.requestContext.stage;
		url += `/${stage}`;
	}

	return url;
}

export function getEnvStage() {
	const env = config.get<string>('env');
	switch (env) {
		case 'development':
			return '';
		case 'staging':
			return 'stg';
		case 'production':
			return 'prod';
	}
}

export function getDBTablePrefix() {
	const appName = config.get<string>('name');
	return `${getEnvStage()}_${appName}_`;
}

export function decodeJwt<T>(token: string, options?: jwt.DecodeOptions): T {
	const payload: any = jwt.decode(token, options);
	return payload;
}

export function verifyJwt<T>(token: string, jwk?: any, options?: jwt.VerifyOptions): T {
	try {
		let payload: any;
		if (typeof jwk === 'string') {
			payload = jwt.verify(token, jwk, options);
		} else {
			const pem = jwkToPem(jwk);
			payload = jwt.verify(token, pem, options);
		}

		return payload;
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			throw new TokenExpiredError();
		} else if (error.name === 'JsonWebTokenError') {
			throw new TokenInvalidError();
		}

		throw error;
	}
}

export function signJwt(payload: any, options?: jwt.SignOptions) {
	try {
		const jwtInfo: jwt.SignOptions = {};

		if (options) {
			if (!options.expiresIn) {
				jwtInfo.expiresIn = '30m';
			}

			if (!options.jwtid) {
				jwtInfo.jwtid = getUUID(true);
			}

			if (!options.issuer) {
				jwtInfo.issuer = getHost();
			}
		}

		const secretKey = config.get<string>('jwtSecretKey');
		return jwt.sign(payload, secretKey, { ...options, ...jwtInfo });
	} catch (error) {
		throw error;
	}
}

export function unauthorizedError(res: Response, message = 'UNAUTHORIZED ACCESS') {
	res.status(HttpStatus.UNAUTHORIZED).json({
		statusCode: HttpStatus.UNAUTHORIZED,
		message,
	});
}

export function expiredError(res: Response, message = 'EXPIRED') {
	res.status(HttpStatus.UNAUTHORIZED).json({
		statusCode: HttpStatus.UNAUTHORIZED,
		message,
	});
}

export function forbiddenError(res: Response) {
	res.status(HttpStatus.FORBIDDEN).json({
		statusCode: HttpStatus.FORBIDDEN,
		message: 'FORBIDDEN ACCESS',
	});
}

export function notFoundError(res: Response) {
	res.status(HttpStatus.NOT_FOUND).json({
		statusCode: HttpStatus.NOT_FOUND,
		message: 'NOT FOUND',
	});
}

export function internalServerError(res: Response) {
	res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
		statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
		message: 'INTERNAL SERVER ERROR',
	});
}
