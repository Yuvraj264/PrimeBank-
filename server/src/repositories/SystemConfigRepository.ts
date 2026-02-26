import { BaseRepository } from './BaseRepository';
import SystemConfig, { ISystemConfig } from '../models/SystemConfig';

export class SystemConfigRepository extends BaseRepository<ISystemConfig> {
    constructor() {
        super(SystemConfig);
    }
}

export const systemConfigRepository = new SystemConfigRepository();
