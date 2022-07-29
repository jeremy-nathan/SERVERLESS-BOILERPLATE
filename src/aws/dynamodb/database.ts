import * as dynamoose from 'dynamoose';

import * as config from '../../utils/config';
import { getDBTablePrefix } from '../../utils/helper';
import { DatabaseLogger, isLocal } from '../../utils/logger';

if (!config.get<boolean>('isCloudDb')) {
	dynamoose.aws.sdk.config.update({
		region: 'us-east-1',
		accessKeyId: 'xxxx',
		secretAccessKey: 'xxxx',
	});
	dynamoose.aws.ddb.local();
}

dynamoose.model.defaults.set({
	create: isLocal,
	waitforActive: isLocal,
	throughput: 'ON_DEMAND',
	prefix: getDBTablePrefix(),
});

dynamoose.logger.providers.set(DatabaseLogger);

export default dynamoose;
