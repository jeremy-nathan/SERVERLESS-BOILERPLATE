import { Response } from 'express';

import {
	ApiServiceError,
	BadRequestError,
	InternalCommunicationError,
	InternalServerError,
	UnauthorizedAccessError,
} from '../models/errors/http.error';
import { DuplicatePartitionKeyError } from '../models/errors/repo.error';
import { HttpStatus } from './error';
import { forbiddenError, getEnvStage } from './helper';

export function handleError(err: any, res: Response) {
	const { statusCode, message } = err;
	if (statusCode === HttpStatus.FORBIDDEN) {
		forbiddenError(res);
	} else {
		res.status(statusCode ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR).json({
			status: err.name,
			statusCode,
			message,
			data: err.data,
		});
	}
}

export function handleServiceError(func: (...any) => any, error: any, withDetails = false) {
	switch (true) {
		case error instanceof BadRequestError:
		case error instanceof UnauthorizedAccessError:
		case error instanceof DuplicatePartitionKeyError:
			throw error;
		case error instanceof ApiServiceError:
			error.message = error.data?.error?.caused_by?.reason ?? error.data?.error?.reason ?? error.message;
			if (!withDetails) {
				delete error.data;
			}
			throw error;
		default:
			break;
	}

	if (error.code) {
		throw error;
	}

	throw new InternalServerError(`Failed to process ${func.name.substring(6)}`, error);
}

export function handleRepoError(func: (...any) => any, error: any, isCreate = false, message?: string) {
	switch (error.code) {
		case 'ConditionalCheckFailedException': {
			if (isCreate) {
				throw new DuplicatePartitionKeyError();
			}
			break;
		}
		default:
			break;
	}

	throw new InternalServerError(message ? message : `Failed to process ${func.name.substring(6)}`, error);
}

export function handleApiError(func: (...any) => any, error: any, message?: string) {
	if (error.isAxiosError) {
		delete error.config;
		delete error.stack;
	}

	if (getEnvStage() === 'prod') {
		delete error['error@context'];
	}

	if (error.response && error.response.data && message) {
		throw new ApiServiceError(message, error.response.data, error.response.status);
	} else if (error.code) {
		throw new UnauthorizedAccessError(error.message, error);
	} else if (error instanceof BadRequestError || error instanceof ApiServiceError) {
		throw error;
	} else if (!message) {
		throw new InternalCommunicationError(`Failed to process ${func.name.substring(6)}`, error);
	}

	throw new InternalServerError(`Failed to process ${func.name.substring(6)}`, error);
}

export function handleControllerError(err: any, res: Response) {
	res.status(err.statusCode ? err.statusCode : HttpStatus.INTERNAL_SERVER_ERROR).json({
		status: err.name,
		statusCode: err.statusCode,
		message: err.message,
		data: err.data,
	});
}
