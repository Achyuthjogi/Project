'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
                else setUser(null);
            })
            .catch(() => setUser(null));
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className={`glass-panel ${styles.navbar}`}>
            <div className={styles.logo}>
                <Link href="/">
                    <span className="gradient-text">Emotion</span>Share
                </Link>
            </div>

            <div className={styles.links}>
                <Link href="/feed" className={`${styles.link} ${pathname === '/feed' ? styles.active : ''}`}>
                    Community Feed
                </Link>

                {user ? (
                    <>
                        <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
                            Dashboard
                        </Link>
                        <NotificationDropdown />
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className={styles.link}>Log In</Link>
                        <Link href="/register" className={`gradient-bg ${styles.registerBtn}`}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
