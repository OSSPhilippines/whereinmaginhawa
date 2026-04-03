import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy | Where In Maginhawa',
  description: 'Privacy policy for Where In Maginhawa platform',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Where In Maginhawa ("we", "us", or "our") respects your privacy and is committed to protecting your
                personal information. This Privacy Policy explains how we collect, use, and safeguard your data when
                you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Business Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect and display information about restaurants and food establishments, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Business name, address, and location</li>
                <li>Contact information (phone, email, website, social media)</li>
                <li>Operating hours and price ranges</li>
                <li>Cuisine types, specialties, and amenities</li>
                <li>Photos and logos</li>
                <li>Payment methods accepted</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                This information is collected from publicly available sources on the internet, social media platforms,
                business directories, and through direct submissions from business owners or community members.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Contributor Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you submit, edit, or report information on our platform, we may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Your name (optional)</li>
                <li>Your email address (optional)</li>
                <li>Your GitHub username or social media handle (optional)</li>
                <li>Submission timestamp and details</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Providing this information is entirely voluntary. You can contribute anonymously if you prefer.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Analytics and Usage Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect anonymous usage data to improve our platform, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Pages visited and features used</li>
                <li>Device type, browser, and operating system</li>
                <li>General location (city/country level only)</li>
                <li>Referring websites and search terms</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>To provide and maintain our directory platform</li>
                <li>To display accurate business information to users</li>
                <li>To process and review user submissions and edits</li>
                <li>To communicate with contributors about their submissions</li>
                <li>To improve our platform and user experience</li>
                <li>To monitor and analyze platform usage and trends</li>
                <li>To detect, prevent, and address technical issues</li>
              </ul>
              <p className="text-gray-700 leading-relaxed font-semibold">
                We will NEVER sell your information to third parties. Your data is used solely for operating and
                improving the Where In Maginhawa platform.
              </p>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Public Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following information is publicly visible on our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>All business information (name, address, contact details, hours, etc.)</li>
                <li>Contributor names (if provided voluntarily)</li>
                <li>Submission dates and history</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                <strong>By providing your information, you acknowledge that it will be publicly displayed.</strong> If
                you include your name in a submission, other users will be able to see it. We recommend using a
                pseudonym if you prefer to remain anonymous.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Account and Submission Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account or submit information on our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Your submissions are stored in our database and reviewed by our team before publishing</li>
                <li>Your contributor name (if provided) may be publicly visible on place pages</li>
                <li>Your email address is used for authentication and is not publicly displayed</li>
                <li>Account data is stored securely using Supabase authentication services</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Third Parties</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Analytics providers (Google Analytics) for anonymous usage statistics</li>
                <li>Hosting providers (Vercel) for platform infrastructure</li>
                <li>Supabase for database, authentication, and file storage services</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We take reasonable measures to protect your information from unauthorized access, alteration, or
                destruction. However:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>No method of internet transmission is 100% secure</li>
                <li>We cannot guarantee absolute security of your data</li>
                <li>You provide information at your own risk</li>
                <li>Publicly posted information is accessible to anyone with internet access</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Business Owners</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a business owner, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Request corrections to your business information</li>
                <li>Request removal of your business from our directory</li>
                <li>Update your contact information</li>
                <li>Report inaccuracies</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, use the "Suggest Changes" or "Report Closure" features on your business page,
                or contact us directly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Contributors</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have contributed information, you may:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Request removal of your name from public display</li>
                <li>Update your contact information</li>
                <li>Withdraw consent for future communications</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Maintain your authentication session when signed in</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage and traffic patterns</li>
                <li>Improve platform functionality</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may affect some
                platform features.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children. If you believe we have collected information from a child, please contact us
                immediately.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Users</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is hosted and operated in the Philippines. By using our platform, you consent to the
                transfer and processing of your information in the Philippines and other countries where our service
                providers operate.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an
                updated "Last updated" date. Your continued use of the platform after changes constitutes acceptance
                of the revised policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:drum-ice-scoundrel@duck.com"
                    className="text-primary hover:underline"
                  >
                    drum-ice-scoundrel@duck.com
                  </a>
                </li>
              </ul>
            </section>

            {/* Summary */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-3">Key Points:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ We collect publicly available business information and voluntary user contributions</li>
                  <li>✓ We will NEVER sell your data to anyone</li>
                  <li>✓ Information you provide may be publicly visible - expect to be contacted</li>
                  <li>✓ You can request corrections, updates, or removal of information</li>
                  <li>✓ We use standard security measures to protect your data</li>
                  <li>✓ Contributing is voluntary and can be done anonymously</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              See also:{' '}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Use
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
