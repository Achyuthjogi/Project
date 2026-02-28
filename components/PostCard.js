'use client';

import { useState } from 'react';
import styles from './PostCard.module.css';
import CommentSection from './CommentSection';

export default function PostCard({ post, onUpdate, onDelete, isDashboard = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(post.content);
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [showComments, setShowComments] = useState(false);

    const emotionColors = {
        happy: 'var(--emotion-happy)',
        sad: 'var(--emotion-sad)',
        frustrated: 'var(--emotion-frustrated)',
        excited: 'var(--emotion-excited)',
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, emotion: post.emotion, category: post.category }),
            });
            if (res.ok) {
                setIsEditing(false);
                if (onUpdate) onUpdate(post.id, content);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
            if (res.ok && onDelete) onDelete(post.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReport = async () => {
        if (!reportReason) return;
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: post.id, reason: reportReason }),
            });
            if (res.ok) {
                alert('Report submitted successfully.');
                setIsReporting(false);
                setReportReason('');
            } else {
                const body = await res.json();
                alert(body.error || 'Failed to report.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`glass-panel ${styles.card}`}>
            <div className={styles.header}>
                <div className={styles.tags}>
                    <span className={styles.category}>{post.category}</span>
                    <span
                        className={styles.emotion}
                        style={{ color: emotionColors[post.emotion] || 'inherit', borderColor: emotionColors[post.emotion] || 'inherit' }}
                    >
                        {post.emotion}
                    </span>
                </div>
                {isDashboard && (
                    <div className={styles.actions}>
                        <button onClick={() => setIsEditing(!isEditing)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
                    </div>
                )}
                {!isDashboard && !post.isMine && (
                    <button className={styles.reportIconBtn} onClick={() => setIsReporting(!isReporting)} title="Report Post">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className={styles.editForm}>
                    <textarea
                        className={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className={styles.editActions}>
                        <button onClick={handleUpdate} className={styles.saveBtn}>Save</button>
                        <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancel</button>
                    </div>
                </div>
            ) : (
                <p className={styles.content}>{post.content}</p>
            )}

            {showComments && (
                <CommentSection post={post} comments={post.comments} isDashboard={isDashboard} />
            )}

            {isReporting && (
                <div className={styles.reportForm}>
                    <input
                        type="text"
                        placeholder="Reason for reporting..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className={styles.reportInput}
                    />
                    <button onClick={handleReport} className={styles.submitReportBtn}>Submit Report</button>
                </div>
            )}

            <div className={styles.footer}>
                <div className={styles.footerLeft}>
                    <span className={styles.author}>
                        {post.author ? `Posted by ${post.author.email.split('@')[0]}` : 'Anonymous User'}
                    </span>
                    <span className={styles.date}>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className={styles.footerRight}>
                    <button
                        className={styles.commentToggleBtn}
                        onClick={() => setShowComments(!showComments)}
                    >
                        {showComments ? 'Hide Comments' : `Comments (${post.comments?.length || 0})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
