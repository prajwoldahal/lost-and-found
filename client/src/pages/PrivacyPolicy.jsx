import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserX, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        How we collect, use, and protect your personal information
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Effective Date: January 2026 | Last Updated: January 2026
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
                    {/* Introduction */}
                    <section>
                        <p className="text-gray-700 leading-relaxed">
                            Lost & Found Community Website ("we", "our", "us") is committed to protecting your privacy. This
                            Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                            use our platform.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Database className="h-6 w-6 text-primary" />
                            Information We Collect
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    1. Information You Provide
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li><strong>Account Information:</strong> Email address, display name, password (encrypted)</li>
                                    <li><strong>Profile Information:</strong> Profile photo, bio, verification status</li>
                                    <li><strong>Posts:</strong> Lost/found item descriptions, images, locations, categories</li>
                                    <li><strong>Messages:</strong> Chat conversations with other users</li>
                                    <li><strong>Reports:</strong> Content you report for moderation</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    2. Automatically Collected Information
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li><strong>Location Data:</strong> Approximate location when you allow browser permissions</li>
                                    <li><strong>Device Information:</strong> Browser type, operating system</li>
                                    <li><strong>Usage Data:</strong> Pages visited, features used, interaction patterns</li>
                                    <li><strong>Authentication Data:</strong> Firebase authentication tokens</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    3. Third-Party Information
                                </h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li><strong>Google OAuth:</strong> Name, email, profile photo (if you sign in with Google)</li>
                                    <li><strong>Firebase/Google Cloud:</strong> Authentication and database services</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="h-6 w-6 text-primary" />
                            How We Use Your Information
                        </h2>

                        <p className="text-gray-700 mb-3">We use the collected information to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Provide and maintain the platform functionality</li>
                            <li>Enable you to create and manage posts about lost/found items</li>
                            <li>Facilitate communication between users through our chat system</li>
                            <li>Display your posts and profile to other users</li>
                            <li>Calculate and display rewards points and leaderboards</li>
                            <li>Moderate content and enforce community guidelines</li>
                            <li>Send notifications about platform activity</li>
                            <li>Improve platform performance and user experience</li>
                            <li>Prevent fraud, spam, and abuse</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* Data Sharing */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Data Sharing and Disclosure
                        </h2>

                        <div className="space-y-3 text-gray-700">
                            <p>
                                <strong>Public Information:</strong> Posts, profile information (name, photo), and rewards
                                points are publicly visible to all platform users.
                            </p>

                            <p>
                                <strong>Private Information:</strong> Your email address, chat messages, and account settings
                                are NOT publicly visible.
                            </p>

                            <p><strong>We share data with:</strong></p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Service Providers:</strong> Firebase/Google Cloud for hosting and authentication</li>
                                <li><strong>Legal Requirements:</strong> If required by law or to protect rights and safety</li>
                                <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics (no personal identification)</li>
                            </ul>

                            <p className="font-semibold text-red-700">
                                We DO NOT sell your personal information to third parties.
                            </p>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="h-6 w-6 text-primary" />
                            Data Security
                        </h2>

                        <p className="text-gray-700 mb-3">
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS) and at rest</li>
                            <li><strong>Firebase Security Rules:</strong> Role-based access control for all data</li>
                            <li><strong>Password Security:</strong> Passwords are hashed and never stored in plain text</li>
                            <li><strong>Chat Privacy:</strong> Only chat participants can access messages</li>
                            <li><strong>Regular Monitoring:</strong> Ongoing security assessments and updates</li>
                        </ul>

                        <p className="text-gray-600 mt-3 italic">
                            However, no system is 100% secure. We cannot guarantee absolute security of your data.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="bg-blue-50 border-l-4 border-primary p-6 rounded">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <UserX className="h-6 w-6 text-primary" />
                            Your Rights and Choices
                        </h2>

                        <p className="text-gray-700 mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Access Your Data:</strong> View all information we have about you</li>
                            <li><strong>Update Your Data:</strong> Edit your profile and account information</li>
                            <li><strong>Delete Your Data:</strong> Request account deletion (irreversible)</li>
                            <li><strong>Withdraw Consent:</strong> Stop using the platform at any time</li>
                            <li><strong>Data Portability:</strong> Request a copy of your data</li>
                            <li><strong>Opt-Out:</strong> Disable location permissions in your browser</li>
                        </ul>

                        <p className="text-gray-800 font-semibold mt-4">
                            To exercise these rights, go to Settings → Account Management or contact us directly.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Data Retention
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Active accounts: Data retained while account is active</li>
                            <li>Deleted accounts: Most data deleted within 30 days</li>
                            <li>Legal requirements: Some data may be retained longer if required by law</li>
                            <li>Anonymized data: May be retained indefinitely for analytics</li>
                        </ul>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Children's Privacy
                        </h2>
                        <p className="text-gray-700">
                            Our platform is not intended for children under 13. We do not knowingly collect personal
                            information from children under 13. If you believe we have collected such information, please
                            contact us immediately.
                        </p>
                    </section>

                    {/* International Users */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            International Users
                        </h2>
                        <p className="text-gray-700">
                            Your data may be processed and stored on servers located outside your country. By using this
                            platform, you consent to international data transfer.
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Changes to This Policy
                        </h2>
                        <p className="text-gray-700">
                            We may update this Privacy Policy periodically. We will notify you of significant changes by
                            posting a prominent notice on the platform or sending an email. Continued use after changes
                            constitutes acceptance.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Contact Us
                        </h2>
                        <p className="text-gray-700 mb-2">
                            If you have questions about this Privacy Policy or want to exercise your rights:
                        </p>
                        <p className="text-gray-800 font-semibold">
                            Email: [Your University Email]
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            We aim to respond to all requests within 7-14 business days.
                        </p>
                    </section>

                    {/* Back Link */}
                    <div className="text-center pt-6">
                        <Link
                            to="/"
                            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
