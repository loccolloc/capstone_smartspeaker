import mongoose from 'mongoose';
import Device from './models/devices.model'; 

const DB_ENDPOINT = 'mongodb+srv://locphan2113971:choancuc123@cluster0.fll8b.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(DB_ENDPOINT)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error: Error) => console.error('MongoDB connection error:', error));


const seedDevices = [

    {
        adaFruitID: '2398009',
        deviceName: 'Độ ẩm không khí',
        deviceState: 'OFF',
        deviceType: 'bedroom.mois',
        userID: "6741f4d371f94fc0bc20becc",
        schedule: [],
        color: 'white',
        minLimit: 0,
        maxLimit: 0,
        lastValue: 0,
        updatedTime: new Date().toISOString(),
        environmentValue: []
    },
    
    {
        adaFruitID: '2298009',
        deviceName: 'Nhiệt độ',
        deviceState: 'OFF',
        deviceType: 'bedroom.temp',
        userID: "6741f4d371f94fc0bc20becc",
        schedule: [],
        color: 'white',
        minLimit: 0,
        maxLimit: 0,
        lastValue: 0,
        updatedTime: new Date().toISOString(),
        environmentValue: []
    },
];


const runSeed = async () => {
    try {
       
        const devices = await Device.insertMany(seedDevices);
        console.log(`${devices.length} devices added to the database.`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        mongoose.connection.close();
    }
};

runSeed();
