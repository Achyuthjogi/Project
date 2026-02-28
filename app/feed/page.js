'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';
import styles from './feed.module.css';

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEmotion, setFilterEmotion] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [user, setUser] = useState(null);

    const emotions = ['happy', 'sad', 'frustrated', 'excited'];
    const categories = ['General', 'College', 'Relationships', 'Work', 'Family', 'Health'];

    useEffect(() => {
        // Check auth to conditionally show PostForm
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            });
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [filterEmotion, filterCategory]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let url = '/api/posts';
            const params = new URLSearchParams();
            if (filterEmotion) params.append('emotion', filterEmotion);
            if (filterCategory) params.append('category', filterCategory);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        // If it matches filters or no filters are active, add to top
        if (
            (!filterEmotion || filterEmotion === newPost.emotion) &&
            (!filterCategory || filterCategory === newPost.category)
        ) {
            setPosts(prev => [newPost, ...prev]);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="gradient-text">Community Feed</h1>
                <p className={styles.subtitle}>Read anonymous stories and experiences from others</p>
            </header>

            {user ? (
                <PostForm onPostCreated={handlePostCreated} />
            ) : (
                <div className={`glass-panel ${styles.loginPrompt}`}>
                    <p>Please log in or register to share your own story.</p>
                </div>
            )}

            <div className={`glass-panel ${styles.filters}`}>
                <div className={styles.filterGroup}>
                    <label>Filter by Emotion:</label>
                    <div className={styles.chipGroup}>
                        <button
                            className={`${styles.chip} ${!filterEmotion ? styles.activeChip : ''}`}
                            onClick={() => setFilterEmotion('')}
                        >
                            All
                        </button>
                        {emotions.map(em => (
                            <button
                                key={em}
                                className={`${styles.chip} ${filterEmotion === em ? styles.activeChip : ''}`}
                                style={{ borderColor: filterEmotion === em ? `var(--emotion-${em})` : 'transparent' }}
                                onClick={() => setFilterEmotion(em)}
                            >
                                {em.charAt(0).toUpperCase() + em.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <label>Filter by Category:</label>
                    <select
                        className={styles.select}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.feed}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading stories...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={`glass-panel ${styles.empty}`}>
                        No stories found matching your filters.
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isDashboard={false}
                        // Even if isMine is true, we don't show edit/delete on feed, only dashboard handles it.
                        />
                    ))
                )}
            </div>
        </div>
    );
}
