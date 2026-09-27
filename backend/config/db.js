import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

export const connectDB = async () => {
    if (!mongoUri) {
        console.warn('MongoDB URI not set. Set MONGO_URI or MONGODB_URI in the backend .env file.');
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
        // console.error('MongoDB connection failed:', error.message);
    }
};