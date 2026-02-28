'use client';

import { useState } from 'react';
import styles from './PostForm.module.css';

export default function PostForm({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [emotion, setEmotion] = useState('happy');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const emotions = [
        { value: 'happy', label: 'Happy', color: 'var(--emotion-happy)' },
        { value: 'sad', label: 'Sad', color: 'var(--emotion-sad)' },
        { value: 'frustrated', label: 'Frustrated', color: 'var(--emotion-frustrated)' },
        { value: 'excited', label: 'Excited', color: 'var(--emotion-excited)' },
    ];

    const categories = ['General', 'College', 'Relationships', 'Work', 'Family', 'Health'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, emotion, category }),
            });

            const data = await res.json();

            if (res.ok) {
                setContent('');
                if (onPostCreated) onPostCreated(data.post);
            } else {
                setError(data.error || 'Failed to create post');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`glass-panel ${styles.container}`}>
            <h2 className={styles.title}>Share your story</h2>
            <p className={styles.subtitle}>Your post will be completely anonymous.</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                    className={styles.textarea}
                    placeholder="What's on your mind? Spill the tea..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />

                <div className={styles.controls}>
                    <div className={styles.selectors}>
                        <div className={styles.field}>
                            <label>Emotion</label>
                            <div className={styles.emotionsList}>
                                {emotions.map(em => (
                                    <button
                                        key={em.value}
                                        type="button"
                                        className={`${styles.emotionBtn} ${emotion === em.value ? styles.activeEmotion : ''}`}
                                        style={{
                                            borderColor: emotion === em.value ? em.color : 'transparent',
                                            color: emotion === em.value ? em.color : 'var(--text-secondary)'
                                        }}
                                        onClick={() => setEmotion(em.value)}
                                    >
                                        {em.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                className={styles.select}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`gradient-bg ${styles.submitBtn}`}
                        disabled={loading || !content.trim()}
                    >
                        {loading ? 'Posting...' : 'Share Anonymously'}
                    </button>
                </div>
            </form>
        </div>
    );
}
