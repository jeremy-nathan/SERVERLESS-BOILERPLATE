// DO NOT SORTING THESE IMPORT MODULES
import 'reflect-metadata';
import './utils/prototype';

import * as AWS from 'aws-sdk';
import http from 'node:http';
import https from 'node:https';

import AWSXRay from './aws/xray/service';
import Logger, { isXRayEnabled } from './utils/logger';

import type { Context, Handler } from 'aws-lambda';
// DO NOT SORTING THESE IMPORT MODULES

const EventLogger = new Logger('event:dynamodb');

export const handler = async (event: Handler | any, context: Context) => {
	try {
		/** Immediate response for WarmUp plugin */
		if (event.source === 'serverless-plugin-warmup') {
			// eslint-disable-next-line no-console
			console.log('WarmUp - Lambda is warm!');
			await new Promise((r) => setTimeout(r, 25));
			return 'Lambda is warm!';
		} else {
			if (isXRayEnabled) {
				AWSXRay.captureAWS(AWS);
				AWSXRay.captureHTTPsGlobal(http, true);
				AWSXRay.captureHTTPsGlobal(https, true);
				AWSXRay.capturePromise();
			}

			if (event.Records.length > 0) {
				EventLogger.info('DynamoDB Stream Events Success', event);
			}
		}
	} catch (error) {
		EventLogger.error('DynamoDB Stream Events Failed', { event, error });
	}
};
