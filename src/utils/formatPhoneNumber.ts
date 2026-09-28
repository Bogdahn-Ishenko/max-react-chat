import { normalizePhone } from './normalizePhone';

export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    
    const cleanJid = phone.split('@')[0];
    
    
    const cleaned = normalizePhone(cleanJid);
    
    
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    
    return cleanJid;
};
