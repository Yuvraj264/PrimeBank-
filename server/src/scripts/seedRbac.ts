import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role';
import Permission from '../models/Permission';
import RolePermission from '../models/RolePermission';

dotenv.config();

const ROLES = [
    'Super Admin',
    'Branch Manager',
    'Compliance Officer',
    'Risk Analyst',
    'Customer Support',
    'Auditor'
];

const PERMISSIONS = [
    'user:view',
    'user:freeze',
    'transaction:approve',
    'kyc:approve',
    'fraud:investigate',
    'report:generate'
];

const ROLE_PERMISSIONS_MAPPING: Record<string, string[]> = {
    'Super Admin': PERMISSIONS, // All permissions
    'Branch Manager': ['user:view', 'user:freeze', 'transaction:approve'],
    'Compliance Officer': ['user:view', 'kyc:approve', 'fraud:investigate', 'report:generate'],
    'Risk Analyst': ['user:view', 'fraud:investigate', 'report:generate'],
    'Customer Support': ['user:view'],
    'Auditor': ['user:view', 'report:generate']
};

export const seedRBAC = async () => {
    try {
        console.log('🌱 Starting RBAC Seeding...');

        // 1. Seed Permissions
        for (const permName of PERMISSIONS) {
            await Permission.findOneAndUpdate(
                { name: permName },
                { name: permName },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Permissions seeded.');

        // 2. Seed Roles
        for (const roleName of ROLES) {
            await Role.findOneAndUpdate(
                { name: roleName },
                { name: roleName },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Roles seeded.');

        // 3. Map Role Permissions
        const allRoles = await Role.find();
        const allPerms = await Permission.find();

        for (const role of allRoles) {
            const mappedPerms = ROLE_PERMISSIONS_MAPPING[role.name] || [];
            for (const permKey of mappedPerms) {
                const targetPerm = allPerms.find(p => p.name === permKey);
                if (targetPerm) {
                    await RolePermission.findOneAndUpdate(
                        { roleId: role._id, permissionId: targetPerm._id },
                        { roleId: role._id, permissionId: targetPerm._id },
                        { upsert: true }
                    );
                }
            }
        }
        console.log('✅ Role-Permission mappings completed.');

    } catch (error) {
        console.error('❌ Error seeding RBAC:', error);
    }
};

// Run standalone if executed directly
if (require.main === module) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/primebank';
    mongoose.connect(mongoUri)
        .then(async () => {
            console.log('MongoDB Connected.');
            await seedRBAC();
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
