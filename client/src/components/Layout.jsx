// File: Layout.jsx
// Description: Main Layout Wrapper: Standard framing for the website, rendering the top Navbar and global footer.

import Navbar from './Navbar';

// React Component: Renders the Layout user interface elements dynamically
export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-background dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-500 font-outfit">
            <Navbar />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
                {children}
            </main>
            <footer className="bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 py-10 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} Lost & Found Community &bull; Crafted for Safety
                </div>
            </footer>
        </div>
    );
}
