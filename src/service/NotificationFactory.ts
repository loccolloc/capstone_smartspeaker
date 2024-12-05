import { Notification } from '../models/notification.model';
import winston from 'winston';
interface NotificationData {
    context: string;
    notificationType: string;
    email: string | undefined;
    deviceName: string;
}
class NotificationFactory {
    static async createNotification({ context, notificationType, email, deviceName }: NotificationData) {
        const notification = new Notification({
            context,
            notificationType,
            email,
            deviceName
        });
        await notification.save();
        winston
            .createLogger({
                level: 'info',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                transports: [
                    new winston.transports.Console(),
                    new winston.transports.File({
                        filename: 'logs.log',
                        level: 'info'
                    })
                ]
            })
            .info(`Notification created: ${notification}`);
    }
    static async createErrorNotification({ context, email, deviceName }: Omit<NotificationData, 'notificationType'>) {
        await NotificationFactory.createNotification({ context, notificationType: 'error', email, deviceName });
    }
    static async createSuccessNotification({ context, email, deviceName }: Omit<NotificationData, 'notificationType'>) {
        await NotificationFactory.createNotification({ context, notificationType: 'success', email, deviceName });
    }
    static async createWarningNotification({ context, email, deviceName }: Omit<NotificationData, 'notificationType'>) {
        await NotificationFactory.createNotification({ context, notificationType: 'warning', email, deviceName });
    }
    static async createInfoNotification({ context, email, deviceName }: Omit<NotificationData, 'notificationType'>) {
        await NotificationFactory.createNotification({ context, notificationType: 'schedule', email, deviceName });
    }
}
export default NotificationFactory;
