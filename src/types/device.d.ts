type DeviceType = 'led' | 'earthhumidity' | 'airhumidity' | 'temperature' | 'waterpump' | 'light';
type ColorType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'white';
type DeviceState = 'ON' | 'OFF' | 'NONE';
type ControlType = 'manual' | 'schedule' | 'limit';
interface Scheduler {
    startTime: string;
    endTime: string;
}

interface DeviceSchema {
    deviceName: string;
    deviceState: DeviceState;
    deviceType: DeviceType;
    userID: string;
    schedule: Scheduler[];
    color: ColorType;
    minLimit: number;
    maxLimit: number;
    lastValue: number;
    updatedTime: string;
    environmentValue: { value: number; createdTime: string; controlType?: ControlType }[];
    adaFruitID: string;
}

interface MQTTDeviceData {
    lastValue: number;
    deviceState?: DeviceState;
    updatedTime?: string;
    environmentValue?: { value: number; createdTime: string }[];
}
