import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import healthcheck from 'express-healthcheck';
import useragent from 'express-useragent';
import fs from 'fs-extra';
import helmet from 'helmet';
import nocache from 'nocache';
import path from 'node:path';
import * as queryTypes from 'query-types';
import responseTime from 'response-time';
import swaggerJsdoc from 'swagger-jsdoc';

import AWSXRay from './aws/xray/service';
import router from './routes/router';
import * as config from './utils/config';
import { handleError } from './utils/handler';
import { getEnvStage, getHost, notFoundError } from './utils/helper';
import { HTTPLogger, isLocal, isXRayEnabled, setResponseBody } from './utils/logger';

if (isLocal) {
	const options = {
		swaggerDefinition: {
			// Like the one described here: https://swagger.io/specification/#infoObject
			info: {
				title: 'MMT Centralized Bank List API',
				version: '1.0.0',
				description: 'MMT Centralized Bank List API Documentation',
			},
			openapi: '3.0.0',
			servers: [
				{
					url: '/api',
				},
			],
		},
		// List of files to be processes. You can also set globs './routes/*.js'
		apis: ['./src/routes/*.ts', './src/models/**/*.ts'],
	};
	const specs = swaggerJsdoc(options);
	fs.writeJsonSync(path.join(__dirname, 'public/swagger.json').replace('/.esbuild/.build', ''), specs, { spaces: '\t' });
}

const app = express();

if (isXRayEnabled) {
	app.use(AWSXRay.express.openSegment(`${config.get<string>('service')}-${getEnvStage()}-App`));
}

app.disable('x-powered-by');
app.use(helmet());
app.use((req, res, next) => {
	const host = getHost();
	if (host) {
		res.setHeader('X-Frame-Options', `ALLOW-FROM ${host}`);
	}

	next();
});

app.use(useragent.express());
app.use(responseTime());
app.use(compression());
app.use(nocache());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(queryTypes.middleware());
app.use('/api', express.static(isLocal ? path.join(__dirname, 'public').replace('/.esbuild/.build', '') : path.join(__dirname, 'public')));
app.use('/api/healthcheck', healthcheck());
app.get('/favicon.ico', function (req, res) {
	res.sendStatus(204);
});
app.use(setResponseBody);
app.use(HTTPLogger);

app.use('/api', router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	handleError(err, res);
});

app.use((req: Request, res: Response) => {
	notFoundError(res);
});

if (isXRayEnabled) {
	app.use(AWSXRay.express.closeSegment());
}

// Export your express server so you can import it in the lambda function.
export default app;
