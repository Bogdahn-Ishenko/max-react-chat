import React, { useState } from "react";
import Button from "../ui/Button/Button";
import type { AuthCredentials } from "../../types/auth";
import styles from './AuthForm.module.css';

interface AuthFormProps {
    onLogin: (credentials: AuthCredentials) => Promise<void> | void;
}

function AuthForm({ onLogin }: AuthFormProps) {
    const [idInstance, setIdInstance] = useState('');
    const [apiTokenInstance, setApiTokenInstance] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isFormValid = idInstance.trim() !== '' && apiTokenInstance.trim() !== '';

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isFormValid || loading) {
            return;
        }

        const credentials = {
            idInstance: idInstance.trim(),
            apiTokenInstance: apiTokenInstance.trim(),
        };

        setLoading(true);
        setError('');

        try {
            await onLogin(credentials);
        } catch (err: any) {
            setError(err.message || 'Неверный ID аккаунта или токен');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1>MAX Чат</h1>

                <p className={styles.description}>
                    Введите свой токен GREEN-API для продолжения
                </p>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <label className={styles.field}>
                    <span>ID аккаунта</span>
                    <input
                        type="text"
                        value={idInstance}
                        onChange={(event) => setIdInstance(event.target.value)}
                        placeholder="Введите ID аккаунта"
                        autoComplete="off"
                    />
                </label>

                <label className={styles.field}>
                    <span>Токен GREEN-API</span>
                    <input
                        type="password"
                        value={apiTokenInstance}
                        onChange={(event) => setApiTokenInstance(event.target.value)}
                        placeholder="Введите токен GREEN-API"
                        autoComplete="off"
                    />
                </label>

                <Button
                    className={styles.submit}
                    type="submit"
                    disabled={!isFormValid || loading}
                >
                    {loading ? 'Проверка...' : 'Войти'}
                </Button>
            </form>
        </main>
    );
}

export default AuthForm;
