import { RecurrenceOption } from '../constants';

export interface ParsedRrule {
    freq?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    byday?: string[]; // SU, MO, TU, WE, TH, FR, SA
    until?: Date; // Date object in UTC
    count?: number;
}

export const parseRruleString = (rruleString?: string): ParsedRrule | null => {
    if (!rruleString || !rruleString.startsWith('FREQ=')) return null;

    // Check if it's one of the simple RecurrenceOption values (excluding CUSTOM)
    const simpleOptions = Object.values(RecurrenceOption).filter(o => o !== RecurrenceOption.CUSTOM && o !== RecurrenceOption.NONE);
    if (simpleOptions.includes(rruleString as RecurrenceOption)) {
        // For simple, non-custom rules like "Todos os dias", convert to a basic ParsedRrule
        // This part might need more sophisticated mapping if complex simple rules are needed later
        switch (rruleString) {
            case RecurrenceOption.DAILY: return { freq: 'DAILY', interval: 1 };
            case RecurrenceOption.WEEKLY: return { freq: 'WEEKLY', interval: 1 };
            case RecurrenceOption.MONTHLY: return { freq: 'MONTHLY', interval: 1 };
            case RecurrenceOption.YEARLY: return { freq: 'YEARLY', interval: 1 };
            default: return null; // Should not happen if it's a valid simple option
        }
    }


    const parsed: ParsedRrule = {};
    const parts = rruleString.split(';');
    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (!value) return;
        switch (key) {
            case 'FREQ':
                parsed.freq = value as ParsedRrule['freq'];
                break;
            case 'INTERVAL':
                parsed.interval = parseInt(value, 10);
                break;
            case 'BYDAY':
                parsed.byday = value.split(',');
                break;
            case 'UNTIL': // Expects YYYYMMDDTHHMMSSZ
                const year = parseInt(value.substring(0, 4), 10);
                const month = parseInt(value.substring(4, 6), 10) - 1; // JS months are 0-indexed
                const day = parseInt(value.substring(6, 8), 10);
                const hour = parseInt(value.substring(9, 11), 10);
                const minute = parseInt(value.substring(11, 13), 10);
                const second = parseInt(value.substring(13, 15), 10);
                parsed.until = new Date(Date.UTC(year, month, day, hour, minute, second));
                break;
            case 'COUNT':
                parsed.count = parseInt(value, 10);
                break;
        }
    });
    if (!parsed.interval) parsed.interval = 1; // Default interval to 1 if not specified
    return parsed;
};
