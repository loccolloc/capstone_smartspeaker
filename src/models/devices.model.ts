import mongoose, { Schema } from 'mongoose';
const deviceSchemaFields: Record<string, any> = {
    adaFruitID: { type: String, required: true },
    deviceName: { type: String, required: true },
    deviceState: { type: String, enum: ['ON', 'OFF', 'NONE'], required: true },
    deviceType: {
        type: String,
        enum: [ 'speaker.volume' ,'bedroom.fan','living-room.sub-light','living-room.main-light','bedroom.sub-light','bedroom.main-light','living-room.fan'],
        required: true,
    },
    userID: { type: String }, 
    schedule: [
        {
            startTime: { type: String },
            endTime: { type: String },
        },
    ],
    color: {
        type: String,
        enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white'],
        default: 'white',
    },
    minLimit: { type: Number, default: 0 },
    maxLimit: { type: Number, default: 0 },
    lastValue: { type: Number, required: true },
    updatedTime: { type: String, required: true },
    environmentValue: [
        {
            value: { type: Number },
            createdTime: { type: String },
            controlType: { type: String, enum: ['manual', 'schedule', 'limit'] },
        },
    ],
};

const deviceSchema = new Schema(deviceSchemaFields);
const Device = mongoose.model('Device', deviceSchema);

export default Device;
