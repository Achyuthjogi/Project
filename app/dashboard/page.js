'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchUserAndPosts();
    }, []);

    const fetchUserAndPosts = async () => {
        try {
            // Get user
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();

            if (!userData.user) {
                router.push('/login');
                return;
            }
            setUser(userData.user);

            // Get user's posts
            const postsRes = await fetch('/api/posts?dashboard=true');
            const postsData = await postsRes.json();

            if (postsRes.ok) {
                setPosts(postsData.posts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePost = (id, newContent) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
    };

    const handleDeletePost = (id) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="gradient-text">Your Space</h1>
                <p className={styles.subtitle}>Manage your profile and past stories</p>
            </header>

            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <div className={`glass-panel ${styles.profileCard}`}>
                        <div className={styles.avatar}>
                            {user?.email.charAt(0).toUpperCase()}
                        </div>
                        <h2 className={styles.username}>@{user?.email.split('@')[0]}</h2>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{posts.length}</span>
                                <span className={styles.statLabel}>Stories Shared</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </span>
                                <span className={styles.statLabel}>Joined</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className={styles.main}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.activeTab}`}>My Stories</button>
                    </div>

                    <div className={styles.feed}>
                        {posts.length === 0 ? (
                            <div className={`glass-panel ${styles.empty}`}>
                                <p>You haven't shared any stories yet.</p>
                                <button onClick={() => router.push('/feed')} className={`gradient-bg ${styles.btn}`}>
                                    Share Your First Story
                                </button>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    isDashboard={true}
                                    onUpdate={handleUpdatePost}
                                    onDelete={handleDeletePost}
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
