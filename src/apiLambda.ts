// DO NOT SORTING THESE IMPORT MODULES
import 'reflect-metadata';
import './utils/prototype';

import * as AWS from 'aws-sdk';
import http from 'node:http';
import https from 'node:https';

import serverless from '@vendia/serverless-express';

import app from './app';
import AWSXRay from './aws/xray/service';
import { isXRayEnabled } from './utils/logger';

import type { APIGatewayProxyHandler, Callback, Context, Handler } from 'aws-lambda';
// DO NOT SORTING THESE IMPORT MODULES

const serverlessHandler = serverless({ app });

export const handler: APIGatewayProxyHandler | any = async (event: Handler | any, context: Context, callback: Callback) => {
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

			return serverlessHandler(event, context, callback);
		}
	} catch (error) {
		return Promise.reject(error);
	}
};
