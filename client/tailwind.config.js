/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            outfit: ['Outfit', 'sans-serif'],
        },
        extend: {
            colors: {
                // Trust & Safety Color Palette
                primary: {
                    light: '#3B82F6',    // Sky Blue
                    DEFAULT: '#1E3A8A',  // Deep Blue
                    dark: '#1E40AF',     // Darker Blue
                },
                secondary: '#3B82F6',    // Sky Blue
                accent: '#10B981',       // Emerald Green

                // Neutral colors
                background: '#F9FAFB',   // Light Gray
                surface: '#FFFFFF',      // White

                // Status colors
                error: '#EF4444',        // Red
                warning: '#F59E0B',      // Orange
                success: '#10B981',      // Emerald Green
                info: '#3B82F6',         // Sky Blue

                // Text colors
                textPrimary: '#111827',   // Dark Gray
                textSecondary: '#6B7280', // Gray
            },
        },
    },
    plugins: [],
}
