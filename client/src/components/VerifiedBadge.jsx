// File: VerifiedBadge.jsx
// Description: Verified Checkmark Badge: Displays a verified blue check icon next to users approved by administrators.

import { ShieldCheck } from 'lucide-react';

/**
 * A reusable component to display a verification badge.
 * @param {boolean} verified - Whether the user is verified.
 * @param {string} className - Optional tailwind classes for the icon.
 * @param {string} size - Size of the icon (default: 'h-4 w-4').
 */
// React Component: Renders the VerifiedBadge user interface elements dynamically
export default function VerifiedBadge({ verified, className = '', size = 'h-4 w-4' }) {
    if (!verified) return null;

    return (
        <ShieldCheck
            className={`${size} text-primary fill-primary/10 flex-shrink-0 ${className}`}
            title="Verified Account"
        />
    );
}
