'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.includes('@')) {
            setError('A valid email Address is required.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/feed');
                router.refresh();
            } else {
                setError(data.error || 'Registration failed. Please try again.');
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
                <h1 className={`${styles.title} gradient-text`}>Join Emotion Share</h1>
                <p className={styles.subtitle}>Create an anonymous account to share your feelings</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleRegister} className={styles.form}>
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.linkText}>
                    Already have an account? <Link href="/login" className={styles.link}>Log in here</Link>
                </p>
            </div>
        </div>
    );
}
