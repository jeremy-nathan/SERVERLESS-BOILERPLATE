import { ErrorHandler, HttpStatus } from '../../utils/error';

export class TokenInvalidError extends ErrorHandler {
	constructor(message = 'Token Invalid', data = {}) {
		super(HttpStatus.BAD_REQUEST, message, data);
	}
}

export class TokenExpiredError extends ErrorHandler {
	constructor(message = 'Token Expired', data = {}) {
		super(HttpStatus.UNAUTHORIZED, message, data);
	}
}

export class TokenAuthorizeError extends ErrorHandler {
	constructor(message = 'Unauthorized Access', data = {}) {
		super(HttpStatus.UNAUTHORIZED, message, data);
	}
}
