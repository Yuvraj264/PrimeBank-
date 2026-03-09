import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Create a named connection specifically for biometric data
export const biometricDb = mongoose.createConnection(
    process.env.MONGO_URI_BIOMETRIC || 'mongodb://localhost:27017/primebank_biometrics'
);

biometricDb.on('connected', () => {
    console.log(`MongoDB Biometric DB Connected: ${biometricDb.host}`);
});

biometricDb.on('error', (err) => {
    console.error(`MongoDB Biometric DB Connection Error: ${err.message}`);
});
