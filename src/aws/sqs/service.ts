import autoBind from 'auto-bind';
import AWS from 'aws-sdk';

import { handleApiError } from '../../utils/handler';
import { stringify } from '../../utils/helper';
import Logger from '../../utils/logger';

export default class AWSSQS {
	private sqs: AWS.SQS;
	private logger: Logger;

	constructor() {
		this.sqs = new AWS.SQS();
		this.logger = new Logger('aws:sqs');
		autoBind(this);
	}

	public async getQueueUrl(topic: string): Promise<string> {
		try {
			const response = await this.sqs.getQueueUrl({ QueueName: topic }).promise();
			return response.QueueUrl;
		} catch (error) {
			handleApiError(this.getQueueUrl, error);
		}
	}

	public async sendMessage(queueUrl: string, body: any, groupId?: string): Promise<AWS.SQS.SendMessageResult> {
		try {
			const response = await this.sqs
				.sendMessage({
					QueueUrl: queueUrl,
					MessageBody: stringify(body),
					MessageGroupId: queueUrl.includes('.fifo') && groupId ? groupId : undefined,
				})
				.promise();

			return response;
		} catch (error) {
			this.logger.error('Failed to send SQS message', error, body);
			return null;
		}
	}
}
