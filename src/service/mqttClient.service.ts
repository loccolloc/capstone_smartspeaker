import mqtt from 'mqtt';
import   UserModel  from '../models/user.model';
import   Device  from '../models/devices.model';
import NotificationFactory from './NotificationFactory';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const ADAFRUIT_IO_USERNAME = process.env.ADAFRUIT_IO_USERNAME;
const ADAFRUIT_IO_KEY = process.env.ADAFRUIT_IO_KEY;
if (!ADAFRUIT_IO_USERNAME || !ADAFRUIT_IO_KEY) {
    console.error("Missing environment variables");
    process.exit(1); 
}

class MQTTClient {
    private client: mqtt.MqttClient;
    private constructor() {
        const url = `mqtts://${ADAFRUIT_IO_USERNAME}:${ADAFRUIT_IO_KEY}@io.adafruit.com`;
        this.client = mqtt.connect(url, {
            port: 8883,   
            rejectUnauthorized: false 
        });

      
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        this.client.on('error', (err) => {
            console.error('MQTT Client Error:', err);
        });
    }

    static instance: MQTTClient;

    static getInstance() {
        if (!MQTTClient.instance) {
            MQTTClient.instance = new MQTTClient();
        }
        return MQTTClient.instance;
    }

    private onConnect() {
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
        });
    }

    onMessage(callback: (topic: string, message: string) => void) {
        this.client.on('message', (topic, message) => {
            callback(topic, message.toString());
        });
    }

    subscribe(topic: string) {
        this.client.subscribe(`${ADAFRUIT_IO_USERNAME}/feeds/${topic}`, (err) => {
            if (err) {
                console.error('Failed to subscribe to topic', topic);
            } else {
                console.log('Subscribed to topic', topic);
            }
        });
    }

    publish(topic: string, message: string) {
        this.client.publish(`${ADAFRUIT_IO_USERNAME}/feeds/${topic}`, message, async (err) => {
            const device = await Device.findOne({ adaFruitID: topic });
            const user = await UserModel.findOne({ _id: device?.userID });
            if (err) {
                console.error('Failed to publish message to topic', topic);
                await NotificationFactory.createErrorNotification({
                    context: 'Đã xảy ra lỗi khi điều khiển thiết bị',
                    email: user?.email,
                    deviceName: device?.deviceName
                });
            } else {
                console.log('Published message to topic', topic);
                const state = message === '1' ? 'bật' : 'tắt';
                await NotificationFactory.createSuccessNotification({
                    context: `Thiết bị ${device?.deviceName} đã được ${state}`,
                    email: user?.email,
                    deviceName: device?.deviceName
                });
            }
        });
    }

    publishColor(topic: string, message: string) {
        this.client.publish(`${ADAFRUIT_IO_USERNAME}/feeds/${topic}`, message, async (err) => {
            if (err) {
                console.error('Failed to publish message to topic', topic);
            } else {
                console.log('Published message to topic', topic);
            }
        });
    }

    publishSpeechRecognition(topic: string, message: string) {
        this.client.publish(`${ADAFRUIT_IO_USERNAME}/feeds/${topic}`, message, async (err) => {
            if (err) {
                console.error('Failed to publish message to topic', topic);
            } else {
                console.log('Published message to topic', topic);
            }
        });
    }
}

const mqttClient = MQTTClient.getInstance();

export { mqttClient };