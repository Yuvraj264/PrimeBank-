import mongoose, { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
    public model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findOne(query: Record<string, any>): Promise<T | null> {
        return await this.model.findOne(query);
    }

    async find(query: Record<string, any> = {}): Promise<T[]> {
        return await this.model.find(query);
    }

    async updateById(id: string, data: mongoose.UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id);
    }
}
