// File: src/components/UserAvatar.jsx

import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

// Simple in-memory cache for user data (displayName & photoURL)
const userCache = new Map();

/**
 * UserAvatar component
 * @param {object} props
 * @param {string} props.userId - UID of the user
 * @param {string} [props.fallback] - Fallback avatar URL
 * @param {string} [props.className] - CSS classes for the img
 * @param {string} [props.alt] - Alt text
 */
export default function UserAvatar({ userId, fallback = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', className = 'h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover', alt = 'User' }) {
  const [photoURL, setPhotoURL] = useState(fallback);

  useEffect(() => {
    let isMounted = true;
    if (!userId) return;

    const cached = userCache.get(userId);
    if (cached && cached.photoURL) {
      setPhotoURL(cached.photoURL);
      return;
    }

    // Fetch latest data from backend
    userAPI.get(userId)
      .then(res => {
        const photo = res.data?.photoURL || fallback;
        const name = res.data?.displayName || null;
        const existing = userCache.get(userId) || {};
        userCache.set(userId, { ...existing, photoURL: photo, displayName: name });
        if (isMounted) setPhotoURL(photo);
      })
      .catch(err => {
        console.error('Failed to fetch user avatar:', err);
        if (isMounted) setPhotoURL(fallback);
      });

    return () => { isMounted = false; };
  }, [userId, fallback]);

  return <img src={photoURL} className={className} alt={alt} />;
}
