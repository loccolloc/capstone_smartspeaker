import  Device  from '../models/devices.model';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { mqttController } from './mqtt.controller';
import  User  from '../models/user.model';
import NotificationFactory from '../service/NotificationFactory';
import mongoose from 'mongoose';

export const getAllDevice = async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;
        const limit = parseInt(req.params.limit);
        let devices;
        if (limit === 0) {
            devices = await Device.find({ userID });
        } else {
            devices = await Device.find({ userID }).slice('environmentValue', -limit);
        }
        res.status(StatusCodes.OK).json({ devices });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
export const removeDeviceUser = async (req: Request, res: Response) => {
    try {
        const device = await Device.findOne({ adaFruitID: req.params.deviceID });
        console.log("device:", device);
        if (!device) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        }
       
        const user = await User.findById(device.userID);
       
        device.userID = undefined;
        
        device.deviceName = device.deviceType;
       
        device.schedule = [];
       
        // if (device.deviceType === 'led') {
        //     console.log("6------------------------");
        //     device.color = 'white';
        //     mqttController.UpdateDeviceColor('color', device.color);
        //     console.log("7------------------------");
        // }
        try {
            await device.save();
        } catch (saveError) {
            console.error("Error saving device:", saveError);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error saving device', details: saveError });
        }
        await NotificationFactory.createSuccessNotification({
            context: `Thiết bị ${device.deviceName} đã được xóa!`,
            email: user?.email,
            deviceName: device.deviceName
        });
        return res.status(StatusCodes.OK).json({ message: 'Device updated', device });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
export const removeManyDevice = async (req: Request, res: Response) => {
    try {
        const deviceIDs = req.body.deviceIDs;
        const devices = await Device.find({ adaFruitID: { $in: deviceIDs } });
        if (!devices) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        const user = await User.findById(devices[0].userID);
        devices.forEach(async (device) => {
            device.userID = undefined;
            device.deviceName = device.deviceType;
            await device.save();
            await NotificationFactory.createSuccessNotification({
                context: `Thiết bị ${device.deviceName} đã được xóa!`,
                email: user?.email,
                deviceName: device.deviceName
            });
        });
        return res.status(StatusCodes.OK).json({ message: 'Device updated', devices });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const updateDeviceUser = async (req: Request, res: Response) => {
    try {
        const deviceIDs = req.body.deviceIDs.split(',');
        const regex = /^[0-9]{7}$/;
        const user = await User.findById(req.body.userID);
        const invalidDeviceIDs = deviceIDs.filter((deviceID: string) => !regex.test(deviceID));
        if (invalidDeviceIDs.length > 0) {
            invalidDeviceIDs.forEach(async (deviceID: string) => {
                await NotificationFactory.createErrorNotification({
                    context: `Lỗi khi thêm thiết bị: mã thiết bị ${deviceID} không hợp lệ !`,
                    email: user?.email,
                    deviceName: 'Hệ thống'
                });
            });
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Device ID is invalid' });
        }

        const devices = await Promise.all(deviceIDs.map((deviceID: string) => Device.findOne({ adaFruitID: deviceID })));
        const nonExistingDevices = devices.filter((device) => !device);
        if (nonExistingDevices.length > 0) {
            nonExistingDevices.forEach(async (device, index) => {
                await NotificationFactory.createErrorNotification({
                    context: `Lỗi khi thêm thiết bị: thiết bị với mã ${deviceIDs[index]} không tồn tại !`,
                    email: user?.email,
                    deviceName: 'Hệ thống'
                });
            });
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        }
        await Promise.all(
            devices.map(async (device) => {
                if (device?.userID === req.body.userID) {
                    await NotificationFactory.createErrorNotification({
                        context: `Lỗi khi thêm thiết bị: thiết bị ${device.deviceName} đã có trong tài khoản của bạn!`,
                        email: user?.email,
                        deviceName: device.deviceName
                    });
                    return;
                }
                device.userID = req.body.userID;
                await device.save();
                await NotificationFactory.createSuccessNotification({
                    context: `Thiết bị ${device.deviceName} đã được thêm vào tài khoản của bạn!`,
                    email: user?.email,
                    deviceName: device.deviceName
                });
            })
        );

        return res.status(StatusCodes.OK).json({ message: 'success', deviceIDs });
    } catch (error) {
        const user = await User.findById(req.body.userID);
        await NotificationFactory.createErrorNotification({
            context: `Lỗi khi thêm thiết bị: ${error}`,
            email: user?.email,
            deviceName: 'Hệ thống'
        });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
export const getDeviceInfo = async (req: Request, res: Response) => {
    const { deviceID } = req.params;
    console.log('Received device ID:', deviceID);
    try {
       
        if (!mongoose.Types.ObjectId.isValid(req.params.deviceID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid device ID format." });
        }

       
        const device = await Device.findById(req.params.deviceID);

       
        if (!device) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Device not found!" });
        }

       
        return res.status(StatusCodes.OK).json({ device });
    } catch (error) {
       
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const createDevice = async (req: Request, res: Response) => {
    try {
        const device = await Device.create(req.body);
        return res.status(StatusCodes.CREATED).json({ device });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const updateDeviceInfo = async (req: Request, res: Response) => {
    try {
        const adaFruitID = req.params.deviceID;
        console.log("Request Params:", req.params);
        console.log("Request Body:", req.body);
        let device = await Device.findOne({ adaFruitID });
        if (!device){
            console.error("Device not found:", adaFruitID);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        } 
       
        if (device.environmentValue[device.environmentValue.length - 1].controlType === 'limit') {
            const user = await User.findById(device.userID);
            await NotificationFactory.createWarningNotification({
                context: `Thiết bị ${device.deviceName} đã vượt quá giới hạn!`,
                email: user?.email,
                deviceName: device.deviceName
            });

            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Can't control device!" });
        }
       
        const update = {
            $set: {
                deviceState: req.body.deviceState,
                lastValue: req.body.lastValue,
                updatedTime: req.body.updatedTime.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
            },
            $push: {
                environmentValue: {
                    controlType: 'manual'
                }
            }
        };
       
        device = await Device.findOneAndUpdate(
            { adaFruitID: adaFruitID },
            {
                ...update
            },
            {
                new: true
            }
        );
      
        if (req.body.lastValue === 1 && device?.deviceType === 'led') {
            mqttController.UpdateDeviceColor('color', device?.color);
        }
        if (!device) {
            console.error("Device not found:", adaFruitID);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        }
       
        console.log("Publishing to MQTT:", { deviceType: device.deviceType, payload: req.body });
        mqttController.UpdateDeviceInfo(device.deviceType, req.body);
       
        if (!device) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        return res.status(StatusCodes.OK).json({ message: 'device updated : ', device });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
export const updateDeviceInfos = async (req: Request, res: Response) => {
    try {
        const adaFruitID = req.params.deviceID;
        const device = await Device.findOne({ adaFruitID });
        if (!device) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        }
      
        if (req.body.deviceName && device.deviceName !== req.body.deviceName) {
            device.deviceName = req.body.deviceName;
        }
        if (req.body.minLimit && device.minLimit !== req.body.minLimit) {
            device.minLimit = req.body.minLimit;
        }
        if (req.body.maxLimit && device.maxLimit !== req.body.maxLimit) {
            device.maxLimit = req.body.maxLimit;
        }
        if (req.body.schedule && device.schedule !== req.body.schedule) {
            device.schedule = req.body.schedule;
        }
        if (req.body.color && device.color !== req.body.color && device.deviceType === 'led') {
            device.color = req.body.color;
            mqttController.UpdateDeviceColor('color', device?.color);
        }
        await device.save();
        const user = await User.findById(device.userID);
        if (!user?.email) {
            console.error("User email is missing for notification!");
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "User email is required for notification." });
        }
               await NotificationFactory.createSuccessNotification({
            context: `Thông tin thiết bị ${device.deviceName} đã được cập nhật!`,
            email: user?.email,
            deviceName: device.deviceName
        });
        return res.status(StatusCodes.OK).json({ message: 'success', device });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const deleteDevice = async (req: Request, res: Response) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        return res.status(StatusCodes.OK).json({ message: 'device deleted : ', device });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const getValueByType = async (req: Request, res: Response) => {
    try {
        const device = await Device.findOne({ deviceType: 'sensor', sensorType: req.params.sensorType });
        if (!device) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        return res.status(StatusCodes.OK).json({ value: device.environmentValue });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export const addDevice = async (req: Request, res: Response) => {
    try {
        const { userID, deviceID } = req.body; 
        
        let device = await Device.findOne({ adaFruitID: deviceID });
        
        if (!device) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Don't have device!" });
        }
        if (!device) {
            device = new Device({
                adaFruitID: deviceID,
                userID: userID,  
            });
            await device.save();
            return res.status(StatusCodes.CREATED).json({
                message: "Device added and created successfully",
                device,
            });
        }

        if (!device.userID) {
            device.userID = userID;
            await device.save();
            return res.status(StatusCodes.OK).json({
                message: "Device userID updated successfully",
                device,
            });
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Device with ID ${deviceID} already has a user associated with it.`,
        });

    } catch (error) {
        console.error("Error adding/updating device:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
