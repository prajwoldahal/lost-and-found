import { ShieldCheck } from 'lucide-react';

/**
 * A reusable component to display a verification badge.
 * @param {boolean} verified - Whether the user is verified.
 * @param {string} className - Optional tailwind classes for the icon.
 * @param {string} size - Size of the icon (default: 'h-4 w-4').
 */
export default function VerifiedBadge({ verified, className = '', size = 'h-4 w-4' }) {
    if (!verified) return null;

    return (
        <ShieldCheck
            className={`${size} text-primary fill-primary/10 flex-shrink-0 ${className}`}
            title="Verified Account"
        />
    );
}
