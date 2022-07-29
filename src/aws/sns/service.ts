import autoBind from 'auto-bind';
import AWS from 'aws-sdk';

import Logger from '../../utils/logger';

export default class AWSSNS {
	private sns: AWS.SNS;
	private logger: Logger;

	constructor() {
		this.sns = new AWS.SNS();
		this.logger = new Logger('aws:sns');
		autoBind(this);
	}

	public async sendMessage(phoneNo: string, message: string): Promise<AWS.SNS.PublishResponse> {
		try {
			const response = await this.sns
				.publish({
					PhoneNumber: phoneNo,
					Message: message,
				})
				.promise();

			return response;
		} catch (error) {
			this.logger.error('Failed to send SNS message', error);
			return null;
		}
	}
}
