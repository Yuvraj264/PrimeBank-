import api from '@/lib/api';

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getUsers: async (role?: string) => {
        const url = role ? `/admin/users?role=${role}` : '/admin/users';
        const response = await api.get(url);
        return response.data;
    },

    updateUserStatus: async (id: string, status: string) => {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response.data;
    },

    deleteUser: async (id: string) => {
        await api.delete(`/admin/users/${id}`);
    },

    getAllAccounts: async () => {
        const response = await api.get('/admin/accounts');
        return response.data;
    },

    getAccountTransactions: async (id: string) => {
        const response = await api.get(`/admin/accounts/${id}/transactions`);
        return response.data;
    },

    updateAccountStatus: async (id: string, status: string) => {
        const response = await api.patch(`/admin/accounts/${id}/status`, { status });
        return response.data;
    },

    getFlaggedTransactions: async () => {
        const response = await api.get('/compliance/suspicious');
        return response.data;
    },

    resolveFraudAlert: async (id: string, action: 'cleared' | 'blocked') => {
        const status = action === 'cleared' ? 'approved' : 'blocked';
        const response = await api.patch(`/compliance/review/${id}`, { status, adminRemarks: `Action taken via admin portal: ${action}` });
        return response.data;
    },

    getAuditLogs: async (params?: { severity?: string; action?: string }) => {
        const response = await api.get('/admin/audit-logs', { params });
        return response.data;
    },

    downloadReport: async (type: string) => {
        const response = await api.get(`/compliance/reports/${type}?format=csv`, {
            responseType: 'blob'
        });
        return response.data;
    },

    updateEmployeeRole: async (id: string, role: string) => {
        const response = await api.patch(`/admin/employees/${id}/role`, { role });
        return response.data;
    },

    getBlacklistedIPs: async () => {
        const response = await api.get('/admin/fraud/blacklist');
        return response.data;
    },

    blacklistIP: async (ip: string, reason: string) => {
        const response = await api.post('/admin/fraud/blacklist', { ip, reason });
        return response.data;
    },

    removeBlacklistedIP: async (id: string) => {
        await api.delete(`/admin/fraud/blacklist/${id}`);
    },

    getConfig: async () => {
        const response = await api.get('/admin/config');
        return response.data;
    },

    updateConfig: async (config: any) => {
        const response = await api.patch('/admin/config', config);
        return response.data;
    },

    clearSystemCache: async () => {
        const response = await api.post('/admin/system/clear-cache');
        return response.data;
    },

    resetAllSessions: async () => {
        const response = await api.post('/admin/system/reset-sessions');
        return response.data;
    }
};
