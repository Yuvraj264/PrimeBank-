export function jsonToCsv(data: Record<string, any>[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    const headers = Array.from(new Set(data.flatMap(Object.keys)));

    const escapeCsvValue = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
            val = JSON.stringify(val);
        }
        val = String(val);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    };

    const headerRow = headers.map(escapeCsvValue).join(',');
    const rows = data.map(record => {
        return headers.map(header => escapeCsvValue(record[header])).join(',');
    });

    return [headerRow, ...rows].join('\n');
}
