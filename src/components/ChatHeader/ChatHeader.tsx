import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react'; 
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
    phone: string;
    onOpenSidebar: () => void; 
}

function ChatHeader({ phone, onOpenSidebar }: ChatHeaderProps) {
    const formattedPhone = useMemo(() => formatPhoneNumber(phone), [phone]);
    
    const avatarInitials = useMemo(() => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 2 ? cleaned.slice(-2) : '??';
    }, [phone]);

    return (
        <header className={styles.header}>
            <div className={styles.wrapper}>
                <button 
                    type="button" 
                    className={styles.toggleBtn} 
                    onClick={onOpenSidebar}
                    aria-label="Открыть список чатов"
                >
                    <ChevronRight size={24} />
                </button>

                <div className={styles.avatar}>
                    {avatarInitials}
                </div>
                <div className={styles.info}>
                    <strong>{formattedPhone}</strong>
                </div>
            </div>
        </header>
    );
}

export default ChatHeader;
