import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Account from './models/Account';

dotenv.config();

const seedUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/primebank';
        console.log(`Connecting to MongoDB at: ${mongoUri}`);
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Default Users
        const users = [
            {
                name: 'System Administrator',
                email: 'admin@ibank.com',
                password: 'password123',
                role: 'admin',
                phone: '+1-555-0100',
                status: 'active',
                profileCompleted: true
            },
            {
                name: 'Bank Employee',
                email: 'employee@ibank.com',
                password: 'password123',
                role: 'employee',
                phone: '+1-555-0200',
                status: 'active',
                profileCompleted: true
            },
            {
                name: 'Test Customer',
                email: 'customer@ibank.com',
                password: 'password123',
                role: 'customer',
                phone: '+1-555-0300',
                status: 'active',
                profileCompleted: true
            }
        ];

        for (const user of users) {
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                existingUser.password = user.password;
                await existingUser.save();
                console.log(`Updated user: ${user.email}`);
            } else {
                const newUser = await User.create(user);
                console.log(`Created user: ${user.email}`);

                // Create account for customer
                if (newUser.role === 'customer') {
                    const newAccount = await Account.create({
                        userId: newUser._id as any,
                        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                        type: 'savings',
                        balance: 50000,
                        status: 'active',
                        dailyLimit: 50000,
                        usedLimit: 0
                    });
                    console.log(`Created account for: ${user.email}`);
                }
            }
        }

        console.log('Seeding completed');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedUsers();
