import { userRepository } from '../repositories/UserRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { cardRepository } from '../repositories/CardRepository';
import { AppError } from '../utils/appError';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export class AuthService {
    private signAccessToken(id: string): string {
        return jwt.sign({ id }, process.env.JWT_SECRET!, {
            expiresIn: '15m',
        });
    }

    private signRefreshToken(id: string): string {
        return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });
    }

    async register(data: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        const { name, email, password, role, phone } = data;

        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new AppError('User already exists', 400);
        }

        const user = await userRepository.create({
            name,
            email,
            password,
            role,
            phone
        });

        if (user.role === 'customer') {
            const newAccount = await accountRepository.create({
                userId: user._id as any,
                accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                type: 'savings',
                balance: 0,
                status: 'active',
                currency: 'USD'
            });

            const today = new Date();
            const year = today.getFullYear() + 5;
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const expiryDate = `${month}/${year.toString().slice(-2)}`;
            const cvv = String(Math.floor(100 + Math.random() * 900));

            await cardRepository.create({
                userId: user._id as any,
                accountId: newAccount._id as any,
                cardNumber: newAccount.accountNumber, // Mocking to match account
                cardHolder: (user.fullName || user.name || 'CUSTOMER').toUpperCase(),
                expiryDate,
                cvv,
                type: 'visa',
                status: 'active'
            });
        }

        const accessToken = this.signAccessToken((user._id as any).toString());
        const refreshToken = this.signRefreshToken((user._id as any).toString());

        user.refreshToken = refreshToken;
        await user.save();

        return { user, accessToken, refreshToken };
    }

    async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        const user = await userRepository.findByEmail(email, true);

        if (!user || !(await user.matchPassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }

        const accessToken = this.signAccessToken((user._id as any).toString());
        const refreshToken = this.signRefreshToken((user._id as any).toString());

        user.refreshToken = refreshToken;
        await user.save();

        return { user, accessToken, refreshToken };
    }

    async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
        const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!);
        const user = await userRepository.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            throw new AppError('Invalid refresh token', 401);
        }

        const accessToken = this.signAccessToken((user._id as any).toString());
        const refreshToken = this.signRefreshToken((user._id as any).toString());

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    }

    async logout(userId: string): Promise<void> {
        await userRepository.updateById(userId, { refreshToken: '' } as any);
    }

    async getMe(userId: string): Promise<IUser> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    async verifyPassword(userId: string, password: string): Promise<boolean> {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user || !(await user.matchPassword(password))) {
            throw new AppError('Incorrect password', 401);
        }
        return true;
    }

    async setTransactionPin(userId: string, pin: string): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        user.transactionPin = String(pin);
        await user.save();
    }

    async updateProfile(userId: string, data: any): Promise<IUser> {
        const allowedFields = [
            'personalDetails',
            'identityDetails',
            'address',
            'professionalDetails',
            'nominee'
        ];

        const updates: any = {};
        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = data[key];
            }
        });

        if (data.personalDetails?.fullName) {
            updates.name = data.personalDetails.fullName;
        }

        updates.profileCompleted = true;

        const updatedUser = await userRepository.updateById(userId, updates);
        if (!updatedUser) {
            throw new AppError('User not found', 404);
        }

        // Sync name with card if updated
        if (updates.name) {
            const activeCard = await cardRepository.findOne({ userId: userId as any, status: 'active' });
            if (activeCard) {
                await cardRepository.updateById(activeCard._id as any, { cardHolder: updates.name.toUpperCase() } as any);
            }
        }

        return updatedUser;
    }

    async updatePreferences(userId: string, preferences: any): Promise<IUser> {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        user.preferences = { ...user.preferences, ...preferences };
        await user.save();
        return user;
    }

    async requestAccountClosure(userId: string, reason: string): Promise<IUser> {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        user.accountStatus = 'closure_requested';
        // Log the reason or save to a dedicated table if needed
        await user.save();
        return user;
    }
}

export const authService = new AuthService();
