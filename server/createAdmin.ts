// Script to create admin user
// Run with: npx ts-node createAdmin.ts

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User';

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'nasir' });

        if (existingAdmin) {
            console.log('Admin user already exists');

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated existing user to admin role');
            }
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Jio@#$2025', salt);

            const adminUser = await User.create({
                username: 'nasir',
                email: 'nasir@expenses.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
            });

            console.log('Admin user created successfully!');
            console.log('Username:', adminUser.username);
            console.log('Email:', adminUser.email);
            console.log('Role:', adminUser.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdminUser();
