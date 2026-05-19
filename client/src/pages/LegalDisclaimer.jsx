// File: LegalDisclaimer.jsx
// Description: Legal Disclaimer Page: Contains liability notices, terms of service agreements, and legal guidelines for returns.

import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Phone } from 'lucide-react';

// React Component: Renders the LegalDisclaimer user interface elements dynamically
export default function LegalDisclaimer() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-600 flex-shrink-0" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Important Legal Disclaimer
                            </h1>
                            <p className="text-lg text-gray-700">
                                Please read this carefully before using our platform
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                    {/* Community Platform Notice */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            Community-Based Platform
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Lost & Found Community Website is a <strong>community-driven platform</strong> designed to help
                            people reconnect with their lost items through peer-to-peer assistance. This platform is{' '}
                            <strong className="text-red-600">NOT a replacement for official lost and found services, law
                                enforcement agencies, or legal authorities</strong>.
                        </p>
                    </section>

                    {/* Police Reporting */}
                    <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                        <h2 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
                            <Phone className="h-6 w-6" />
                            For Valuable or Important Items
                        </h2>
                        <p className="text-red-800 leading-relaxed mb-3">
                            If you have lost or found items of significant value, identification documents, legal papers,
                            or items that may be involved in a crime, you <strong>MUST</strong> report to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-red-800">
                            <li><strong>Local Police Station</strong> - For official records and legal protection</li>
                            <li><strong>Relevant Authorities</strong> - Government offices for official documents</li>
                            <li><strong>Lost & Found Departments</strong> - At airports, malls, public transport, etc.</li>
                        </ul>
                        <p className="text-red-800 font-semibold mt-4">
                            Using this platform does NOT fulfill legal reporting requirements.
                        </p>
                    </section>

                    {/* Symbolic Rewards */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Rewards System
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Points, badges, and achievements displayed on this platform are <strong>purely symbolic and
                                have no monetary value</strong>. They are designed to encourage community participation and
                            recognize helpful behavior. Points cannot be:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3 ml-4">
                            <li>Exchanged for money or goods</li>
                            <li>Transferred to other users</li>
                            <li>Redeemed for any real-world benefits</li>
                        </ul>
                    </section>

                    {/* Verification Limitations */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Verification & Moderation
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            While we make reasonable efforts to verify posts and moderate content:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>We <strong>cannot guarantee</strong> the accuracy of all information posted</li>
                            <li>Users are responsible for verifying ownership before claiming items</li>
                            <li>ID verification is a best-effort process and not foolproof</li>
                            <li>Admin approval does not constitute legal verification of ownership</li>
                        </ul>
                    </section>

                    {/* User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Your Responsibilities
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>If you found an item:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Make reasonable efforts to verify the true owner</li>
                                <li>Do not demand payment or rewards</li>
                                <li>Meet in safe, public locations for exchanges</li>
                                <li>Report to authorities if required by law</li>
                            </ul>

                            <p className="mt-4"><strong>If you lost an item:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Provide accurate descriptions and proof of ownership</li>
                                <li>Verify the identity of anyone claiming to have found your item</li>
                                <li>Arrange safe meetups in public places</li>
                                <li>File police reports for valuable items</li>
                            </ul>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Limitation of Liability
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            This platform is provided "as is" for community benefit. We are <strong>not liable</strong> for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3 ml-4">
                            <li>Lost, stolen, damaged, or unreturned items</li>
                            <li>Fraudulent posts or false claims</li>
                            <li>Disputes between users</li>
                            <li>Personal safety incidents during meetups</li>
                            <li>Any damages arising from use of this platform</li>
                        </ul>
                    </section>

                    {/* Data & Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Data Protection
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            By using this platform, you consent to data collection and processing as outlined in our{' '}
                            <Link to="/privacy-policy" className="text-primary hover:underline font-semibold">
                                Privacy Policy
                            </Link>. You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3 ml-4">
                            <li>Access your personal data</li>
                            <li>Request data deletion</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    {/* Age Restriction */}
                    <section className="bg-gray-100 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Age Requirement
                        </h2>
                        <p className="text-gray-700">
                            Users must be at least 13 years old to use this platform. Users under 18 should seek parental
                            guidance when arranging meetups.
                        </p>
                    </section>

                    {/* Acceptance */}
                    <section className="bg-primary-light bg-opacity-10 border-2 border-primary p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Acceptance of Terms
                        </h2>
                        <p className="text-gray-800 font-semibold">
                            By continuing to use this platform, you acknowledge that you have read, understood, and agree
                            to this disclaimer and our{' '}
                            <Link to="/terms-of-service" className="text-primary hover:underline">
                                Terms of Service
                            </Link>.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="text-center pt-6">
                        <p className="text-gray-600">
                            Questions about this disclaimer?{' '}
                            <Link to="/" className="text-primary hover:underline font-semibold">
                                Contact Us
                            </Link>
                        </p>
                    </section>

                    {/* Back Link */}
                    <div className="text-center pt-4">
                        <Link
                            to="/"
                            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Last Updated */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Last updated: January 2026
                </p>
            </div>
        </div>
    );
}
