'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/feed');
                router.refresh();
            } else {
                setError(data.error || 'Login failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundGlow} />

            <div className={`glass-panel ${styles.authCard}`}>
                <h1 className={`${styles.title} gradient-text`}>Welcome Back</h1>
                <p className={styles.subtitle}>Log in to access your safe space and connect with the community.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            placeholder="e.g. user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`gradient-bg ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className={styles.linkText}>
                    Don't have an account? <Link href="/register" className={styles.link}>Register here</Link>
                </p>
            </div>
        </div>
    );
}
