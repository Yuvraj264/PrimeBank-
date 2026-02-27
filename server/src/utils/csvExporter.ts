export function jsonToCsv(data: Record<string, any>[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    // Attempt to flatten deeply nested objects if needed, but for now just process top-level keys
    // Extract headers
    const headers = Array.from(new Set(data.flatMap(Object.keys)));

    // Escape CSV values gracefully
    const escapeCsvValue = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
            // Simplify nested json to string to fit in one cell
            val = JSON.stringify(val);
        }
        val = String(val);
        // If string contains comma, quote, or newline, escape it
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
