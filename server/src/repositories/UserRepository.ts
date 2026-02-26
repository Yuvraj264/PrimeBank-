import { BaseRepository } from './BaseRepository';
import User, { IUser } from '../models/User';

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string, selectPassword = false): Promise<IUser | null> {
        if (selectPassword) {
            return await this.model.findOne({ email }).select('+password');
        }
        return await this.model.findOne({ email });
    }

    async findByIdWithPassword(id: string): Promise<IUser | null> {
        return await this.model.findById(id).select('+password');
    }
}

export const userRepository = new UserRepository();
