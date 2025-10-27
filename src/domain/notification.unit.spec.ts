import type { SNSClient } from '@aws-sdk/client-sns';
import { NotificationTemplate, NotificationType } from '../types/notification';
import { mockito } from '../utils/mock';
import { NotificationDomain } from './notification';

describe('NotificationDomain', () => {
	let notificationDomain: NotificationDomain;
	const snsClientMock = mockito.mock<SNSClient>();
	beforeEach(() => {
		jest.resetAllMocks();
		notificationDomain = new NotificationDomain(
			mockito.instance(snsClientMock),
		);
	});
	it('send event', async () => {
		await notificationDomain.sendEvent({
			type: NotificationType.EMAIL,
			destination: 'dummy@destination.com',
			template: NotificationTemplate.NEW_EXPENSE_RECORDED,
			metadata: {
				name: 'Dummy',
			},
		});
		mockito.verify(snsClientMock.send(mockito.anything())).called();
	});
});
