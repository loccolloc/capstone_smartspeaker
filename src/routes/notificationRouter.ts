import { Router } from 'express';
import * as NotificationController from '../controller/notification.controller';

const router = Router();

router.route('/').post(NotificationController.createNotification);
router.route('/:userId').get(NotificationController.getAllNotification);
router.route('/:userId/latest').get(NotificationController.getLatestNotification);
router.route('/:email/:deviceName').get(NotificationController.getNotificationByDevice);
router.route('/:notificationID').delete(NotificationController.deleteNotification);
export { router };