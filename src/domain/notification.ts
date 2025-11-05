import { PublishCommand, type SNSClient } from '@aws-sdk/client-sns';
import logger from '../config/logger';
import snsClient from '../config/sns';
import type { NotificationEvent } from '../types/notification';
import config from '../config/config';

export class NotificationDomain {
	constructor(private readonly snsClient: SNSClient) {}
	async sendEvent(notification: NotificationEvent) {
		const topicArn = config.get<string>('aws.sns.notification');
		const publishParams = {
			TopicArn: topicArn,
			Message: JSON.stringify(notification),
		};

		try {
			const command = new PublishCommand(publishParams);
			await this.snsClient.send(command);
			logger.info({
				message: 'Publishing message',
				topicArn,
				notification,
			});
		} catch (error) {
			logger.error(error, 'Error publishing message:');
			throw error;
		}
	}
}

export const buildNotificationDomain = () => new NotificationDomain(snsClient);
