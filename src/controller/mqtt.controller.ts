import { mqttClient } from '../service/mqttClient.service';
import  Device  from '../models/devices.model';
import path from 'path';
import fs from 'fs';

const GetDeViceInfo = mqttClient.onMessage(async (topic, message) => {
    const regex = /\/feeds\/(\d+)\/json/;
    if (regex.test(topic)) {
        try {
            const jsonMessage = JSON.parse(message);
            const adaFruitID = jsonMessage.id;
            const name = jsonMessage.key;

            if (name === 'color') return;

            let device = await Device.findOne({ adaFruitID }); 

            const updateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });

            if (device) {
                if (updateTime === device.updatedTime) return;

                device.deviceState =
                    jsonMessage.key.split('-')[0] === 'led' || jsonMessage.key.split('-')[0] === 'waterpump'
                        ? jsonMessage.last_value === '1'
                            ? 'ON'
                            : 'OFF'
                        : 'NONE';

                device.lastValue = jsonMessage.last_value;
                device.updatedTime = updateTime;

                if (!device.environmentValue[device.environmentValue.length - 1]?.value) {
                    device.environmentValue[device.environmentValue.length - 1] = {
                        value: jsonMessage.data.value,
                        createdTime: new Date().toLocaleString('en-US', {
                            timeZone: 'Asia/Bangkok',
                        }),
                    };
                } else {
                    device.environmentValue.push({
                        value: jsonMessage.data.value,
                        createdTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
                    });
                }

                await device.save();
            } else {
                device = new Device({
                    adaFruitID: jsonMessage.id,
                    deviceName: jsonMessage.key,
                    deviceType: jsonMessage.key.split('-')[0],
                    deviceState:
                        jsonMessage.key.split('-')[0] === 'led' || jsonMessage.key.split('_')[0] === 'waterpump'
                            ? 'ON'
                            : 'NONE',
                    lastValue: parseInt(jsonMessage.last_value),
                    updatedTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
                    environmentValue: {
                        value: jsonMessage.data.value,
                        createdTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
                    },
                });

                await device.save();
            }

            const dataPath = path.join(__dirname, 'data.json');
            fs.writeFileSync(dataPath, JSON.stringify(device), 'utf8'); 
        } catch (err) {
            console.error('Error parsing message from Adafruit: ', err);
        }
    }
});

const UpdateDeviceInfo = (deviceType: string, body: MQTTDeviceData) => {
    if (Object.keys(body).length !== 0) {
        mqttClient.publish(`${deviceType}`, JSON.stringify(body.lastValue));
    }
};

const UpdateDeviceColor = (adaFruitID: string, body: ColorType) => {
    if (Object.keys(body).length !== 0) {
        mqttClient.publishColor(`${adaFruitID}`, JSON.stringify(body));
    }
};

const UpdateSpeechRecognition = (adaFruitID: string, body: boolean) => {
    mqttClient.publishSpeechRecognition(`${adaFruitID}`, JSON.stringify(body));
};

export const mqttController = {
    GetDeViceInfo,
    UpdateDeviceInfo,
    UpdateDeviceColor,
    UpdateSpeechRecognition,
};
