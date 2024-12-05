import mongoose from 'mongoose';

const userTokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
    revoke: { type: Boolean, default: false } // 30 days
});

export default mongoose.model('UserToken', userTokenSchema);