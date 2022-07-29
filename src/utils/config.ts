import config from 'config';
import { InternalServerError } from '../models/errors/http.error';

export function get<T>(keyName: string): T {
	try {
		if (config.has(keyName)) {
			return config.get<T>(keyName);
		}
	} catch (error) {
		const errorMessage = `Config - ${keyName} is missing`;
		throw new InternalServerError(errorMessage, error);
	}
}
