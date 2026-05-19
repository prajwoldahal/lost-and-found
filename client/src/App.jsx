import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import AdminLayout from './components/AdminLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PostDetails from './pages/PostDetails';
import Search from './pages/Search';
import CreatePost from './pages/CreatePost';
// Profile import removed
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import MyPosts from './pages/MyPosts';
import Rewards from './pages/Rewards';
import LegalDisclaimer from './pages/LegalDisclaimer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Suspended from './pages/Suspended';
// ClaimVerification import removed

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminClaims from './pages/admin/AdminClaims';
import AdminPosts from './pages/admin/AdminPosts';
import AdminLogs from './pages/admin/AdminLogs';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Layout><LandingPage /></Layout>} />
                        <Route path="/login" element={<Layout><Login /></Layout>} />
                        <Route path="/register" element={<Layout><Register /></Layout>} />
                        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/legal-disclaimer" element={<Layout><LegalDisclaimer /></Layout>} />
                        <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
                        <Route path="/suspended" element={<Suspended />} />
                        <Route path="/post/:id" element={<Layout><PostDetails /></Layout>} />

                        {/* Protected User Routes */}
                        <Route path="/dashboard" element={
                            <RequireAuth>
                                <Layout><Dashboard /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/search" element={
                            <RequireAuth>
                                <Layout><Search /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/create-post" element={
                            <RequireAuth>
                                <Layout><CreatePost /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/edit-post/:id" element={
                            <RequireAuth>
                                <Layout><CreatePost /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/settings" element={
                            <RequireAuth>
                                <Layout><Settings /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/messages" element={
                            <RequireAuth>
                                <Layout><Messages /></Layout>
                            </RequireAuth>
                        } />
                        <Route path="/my-posts" element={
                            <RequireAuth>
                                <Layout><MyPosts /></Layout>
                            </RequireAuth>
                        } />
                        {/* Claim route removed */}
                        <Route path="/rewards" element={
                            <RequireAuth>
                                <Layout><Rewards /></Layout>
                            </RequireAuth>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <RequireAdmin>
                                <AdminLayout><AdminDashboard /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/reports" element={
                            <RequireAdmin>
                                <AdminLayout><ReportsManagement /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/posts" element={
                            <RequireAdmin>
                                <AdminLayout><AdminPosts /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/users" element={
                            <RequireAdmin>
                                <AdminLayout><UserManagement /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/categories" element={
                            <RequireAdmin>
                                <AdminLayout><CategoryManagement /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/claims" element={
                            <RequireAdmin>
                                <AdminLayout><AdminClaims /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/settings" element={
                            <RequireAdmin>
                                <AdminLayout><AdminSettings /></AdminLayout>
                            </RequireAdmin>
                        } />
                        <Route path="/admin/logs" element={
                            <RequireAdmin>
                                <AdminLayout><AdminLogs /></AdminLayout>
                            </RequireAdmin>
                        } />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />


                    </Routes>

                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
