import { Router } from 'express';
import * as DeviceController from '../controller/device.controller';

const deviceRouter = Router();


deviceRouter.route('/:userID/:limit').get(DeviceController.getAllDevice);
deviceRouter.route('/:deviceID/removeUser').patch(DeviceController.removeDeviceUser);
deviceRouter.route('/updateUser').patch(DeviceController.updateDeviceUser);
deviceRouter.route('/:deviceID/updateInfo').patch(DeviceController.updateDeviceInfos);
deviceRouter.route('/removeManyDevice').patch(DeviceController.removeManyDevice);
deviceRouter.route('/addDevice').patch(DeviceController.addDevice);
deviceRouter
    .route('/:deviceID')
    .get(DeviceController.getDeviceInfo)
    .patch(DeviceController.updateDeviceInfo)
    .delete(DeviceController.deleteDevice);
deviceRouter.route('/:userID/:sensorType').get(DeviceController.getValueByType);

export default deviceRouter;
