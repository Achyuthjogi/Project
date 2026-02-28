'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => { });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      <main className={styles.hero}>
        <div className={`glass-panel ${styles.heroCard}`}>
          <h1 className={styles.title}>
            Your feelings, <span className="gradient-text">unfiltered</span>.
          </h1>

          <p className={styles.description}>
            Emotion Share is a safe, anonymous community platform designed for you to express your daily life "tea".
            Connect with others through authentic stories, completely judgment-free.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🤫</div>
              <h3>100% Anonymous</h3>
              <p>Mandatory anonymous posting keeps you safe.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🎨</div>
              <h3>Emotion Tags</h3>
              <p>Tag your posts by how you truly feel.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3>Safe Space</h3>
              <p>Community moderation to ensure a healthy environment.</p>
            </div>
          </div>

          <div className={styles.actions}>
            {user ? (
              <Link href="/feed" className={`gradient-bg ${styles.primaryBtn}`}>
                Go to Community Feed
              </Link>
            ) : (
              <>
                <Link href="/register" className={`gradient-bg ${styles.primaryBtn}`}>
                  Join the Community
                </Link>
                <Link href="/feed" className={styles.secondaryBtn}>
                  Read Stories First
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
