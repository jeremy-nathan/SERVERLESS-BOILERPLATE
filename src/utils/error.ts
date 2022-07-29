import autoBind from 'auto-bind';
import { StatusCodes } from 'http-status-codes';

import { stringify } from './helper';
import { ErrorLogger } from './logger';

export const HttpStatus = StatusCodes;

export abstract class ErrorHandler extends Error {
	protected statusCode: number;
	public data: any | ErrorHandler;

	constructor(statusCode: number, message: string, data?: any | ErrorHandler) {
		super(message);

		Error.captureStackTrace(this, this.constructor);

		this.statusCode = statusCode;
		this.name = this.constructor.name.includes('_') ? this.constructor.name.split('_').pop() : this.constructor.name;
		this.data = data;
		autoBind(this);
		this.log();
	}

	getExceptionObject() {
		const errorObject: any = {
			statusCode: this.statusCode,
			name: this.name,
			message: this.message,
			data:
				this.data instanceof Error || (this.data && this.data.stack)
					? {
							innerData: this.data,
							innerStackTrace: this.data.stack,
					  }
					: this.data,
			stackTrace: `${this.stack}`,
		};
		return errorObject;
	}

	log() {
		try {
			const exception = this.getExceptionObject();
			ErrorLogger.error(exception.name, exception);
		} catch (error) {
			const errorStack = stringify(error, Object.getOwnPropertyNames(error));
			ErrorLogger.error('Failed to log', errorStack);
		}
	}
}
