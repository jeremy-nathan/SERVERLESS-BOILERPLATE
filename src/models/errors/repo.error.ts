import { ErrorHandler, HttpStatus } from '../../utils/error';

export class DuplicatePartitionKeyError extends ErrorHandler {
	constructor(message = 'Duplicate partition key', data = {}) {
		super(HttpStatus.BAD_REQUEST, message, data);
	}
}
