import React, { useEffect, useRef } from 'react';
import Button from '../Button/Button';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

function Modal({
    isOpen,
    title,
    description,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    onClose,
    onConfirm
}: ModalProps) {
    
    const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

    
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                cancelBtnRef.current?.focus();
            }, 50);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Tab') return;

        const cancelBtn = cancelBtnRef.current;
        const confirmBtn = confirmBtnRef.current;

        if (!cancelBtn || !confirmBtn) return;

        
        if (event.shiftKey) {
            if (document.activeElement === cancelBtn) {
                confirmBtn.focus();
                event.preventDefault();
            }
        } 
        
        else {
            if (document.activeElement === confirmBtn) {
                cancelBtn.focus();
                event.preventDefault();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className={styles.actions}>
                    <button 
                        ref={cancelBtnRef}
                        type="button" 
                        className={styles.cancelBtn} 
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <Button 
                        ref={confirmBtnRef}
                        type="button" 
                        className={styles.confirmBtn}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
