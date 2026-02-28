'use client';

import { useState } from 'react';
import styles from './CommentSection.module.css';

export default function CommentSection({ post, comments: initialComments, isDashboard }) {
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment, postId: post.id }),
            });

            const data = await res.json();

            if (res.ok) {
                setComments(prev => [...prev, data.comment]);
                setNewComment('');
            } else {
                setError(data.error || 'Failed to post comment.');
            }
        } catch (err) {
            setError('An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            } else {
                alert('Failed to delete comment.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.commentList}>
                {comments.length === 0 ? (
                    <p className={styles.noComments}>No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={styles.commentItem}>
                            <p className={styles.commentContent}>{comment.content}</p>
                            <div className={styles.commentFooter}>
                                <span className={styles.author}>
                                    {comment.author && isDashboard ? `By ${comment.author.email.split('@')[0]}` : 'Anonymous User'}
                                    {comment.isMine && !isDashboard && ' (You)'}
                                </span>
                                {(comment.isMine || post.isMine) && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(comment.id)}
                                        title="Delete Comment"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        placeholder="Add an anonymous comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className={styles.input}
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={!newComment.trim() || isSubmitting}
                    >
                        {isSubmitting ? '...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
