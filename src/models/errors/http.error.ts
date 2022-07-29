import { ErrorHandler, HttpStatus } from '../../utils/error';

export class InternalServerError extends ErrorHandler {
	constructor(message: string, data = {}) {
		super(HttpStatus.INTERNAL_SERVER_ERROR, message, data);
	}
}

export class InternalCommunicationError extends ErrorHandler {
	constructor(message: string, data = {}) {
		super(HttpStatus.SERVICE_UNAVAILABLE, message, data);
	}
}

export class BadRequestError extends ErrorHandler {
	constructor(message = 'Bad Request', data = {}) {
		super(HttpStatus.BAD_REQUEST, message, data);
	}
}

export class ForbiddenError extends ErrorHandler {
	constructor(message = 'Forbidden Access', data = {}) {
		super(HttpStatus.FORBIDDEN, message, data);
	}
}

export class UnauthorizedAccessError extends ErrorHandler {
	constructor(message = 'Unauthorized Access', data = {}) {
		super(HttpStatus.UNAUTHORIZED, message, data);
	}
}

export class ApiServiceError extends ErrorHandler {
	constructor(message: string, data = {}, statusCode = HttpStatus.SERVICE_UNAVAILABLE) {
		super(statusCode, message, data);
	}
}
