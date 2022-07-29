import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { BadRequestError } from '../models/errors/http.error';
import { Request } from '../models/http.interface';

export async function requestBodyValidator<T>(objectClass: ClassConstructor<T>, req: Request<T>, next: any) {
	try {
		const classBody = plainToClass(objectClass, req.body, { excludeExtraneousValues: true });
		await validateOrReject(classBody as Record<string, unknown>, { validationError: { target: false } });

		req.validatedBody = classBody;
		next();
	} catch (error) {
		throw new BadRequestError(undefined, error);
	}
}

export async function requestQueryValidator<T>(objectClass: ClassConstructor<T>, req: Request<T>, next: any) {
	try {
		const classQuery = plainToClass(objectClass, req.query, { excludeExtraneousValues: true });
		await validateOrReject(classQuery as Record<string, unknown>, { validationError: { target: false } });

		req.validatedBody = classQuery;
		next();
	} catch (error) {
		throw new BadRequestError(undefined, error);
	}
}
