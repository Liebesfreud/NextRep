export function toDateStr(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function getTodayDateStr(now = new Date()): string {
    return toDateStr(now);
}

export function getDateBounds(dateStr: string): { startOfDay: Date; endOfDay: Date } {
    const [y, m, d] = dateStr.split("-").map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    return { startOfDay, endOfDay };
}

export function buildTimestampForDate(dateStr: string, now = new Date()): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(
        y,
        m - 1,
        d,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );
}

