import { normalizePhone } from './normalizePhone';

export const toChatId = (phone: string): string | null => {
    const normalized = normalizePhone(phone);
    return normalized ? `${normalized}@c.us` : null;
};
