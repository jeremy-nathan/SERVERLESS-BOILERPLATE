import dotenv from 'dotenv-flow';

dotenv.config({ node_env: 'stg' });

import 'reflect-metadata';
import '../../utils/prototype';
import '../../utils/logger';
import './database';
import '../../services';

// import * as dynamoDBAdmin from 'dynamodb-admin';

const createAndGetCat = async () => {};

const bootStrap = async () => {
	try {
		await createAndGetCat();
	} catch (error) {
		console.log(error);
	}

	// const app: any = await dynamoDBAdmin.createServer();

	// const server = app.listen(8001);
	// server.on('listening', () => {
	// 	const address = server.address();
	// 	console.log(`listening on http://localhost:${address.port}`);
	// });
};

bootStrap();
