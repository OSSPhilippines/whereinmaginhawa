import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms of Use | Where In Maginhawa',
  description: 'Terms of use for businesses and users of Where In Maginhawa platform',
};

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Where In Maginhawa ("Platform", "we", "us", or "our"). By accessing or using our platform,
                you agree to be bound by these Terms of Use. If you disagree with any part of these terms, please do
                not use our platform.
              </p>
            </section>

            {/* For Businesses */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. For Business Owners and Establishments</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Data Collection</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Information about businesses listed on Where In Maginhawa is collected from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Publicly available information on the internet, social media, and business directories</li>
                <li>Information voluntarily submitted by business owners or representatives</li>
                <li>Information submitted by community members and users</li>
                <li>Information gathered through web crawling and automated collection methods</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Contact Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By having your business information listed on our platform (whether through public sources or self-submission),
                you acknowledge and accept that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Your contact information (phone, email, address, website) is publicly visible</li>
                <li>Users may contact you directly using the information provided</li>
                <li>We do not screen or monitor communications between users and businesses</li>
                <li>We are not responsible for unsolicited communications you may receive</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information Updates</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may request updates, corrections, or removal of your business information by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Submitting an edit request through the "Suggest Changes" feature</li>
                <li>Reporting closure through the "Report Closure" feature</li>
                <li>Contacting us directly through our support channels</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Data Usage</h3>
              <p className="text-gray-700 leading-relaxed">
                We will never sell your business data to third parties. Your information is used solely for the purpose
                of providing a community directory of restaurants and food establishments in Maginhawa Street.
              </p>
            </section>

            {/* For Users */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. For Platform Users</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 No Guarantee of Accuracy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we strive to maintain accurate and up-to-date information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>We do not guarantee the accuracy, completeness, or reliability of any business information</li>
                <li>Business details (hours, prices, menus, contact info) may change without notice</li>
                <li>We recommend verifying critical information directly with the establishment</li>
                <li>Information is provided "as is" without warranties of any kind</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Where In Maginhawa and its operators shall not be held liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Any issues, disputes, or damages arising from interactions with listed businesses</li>
                <li>Food quality, safety, hygiene, or any health-related issues</li>
                <li>Service quality, pricing disputes, or business practices of listed establishments</li>
                <li>Injuries, illnesses, or any harm resulting from visiting or patronizing listed businesses</li>
                <li>Financial losses or damages of any kind related to your use of listed businesses</li>
                <li>Inaccurate, outdated, or misleading information on the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 User Responsibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using this platform, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>You visit and patronize businesses at your own risk</li>
                <li>You are responsible for exercising due diligence before visiting any establishment</li>
                <li>You should verify business information independently before making decisions</li>
                <li>Any transactions or interactions with businesses are solely between you and the business</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 User-Submitted Content</h3>
              <p className="text-gray-700 leading-relaxed">
                When you submit information (new places, edits, reviews, or reports), you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Your submission is accurate to the best of your knowledge</li>
                <li>You have the right to submit the information provided</li>
                <li>Your submission does not violate any laws or third-party rights</li>
                <li>We may review, edit, or remove your submission at our discretion</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We respect your privacy and are committed to protecting your personal data. Please review our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for detailed information on how we collect, use, and protect your information.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>We will never sell your data.</strong> Any information you provide (name, email, social media)
                is used solely for platform operations and communication purposes.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. General Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Where In Maginhawa is a community-driven directory platform. We act as an information aggregator
                and do not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Operate, manage, or have any affiliation with listed businesses</li>
                <li>Endorse, recommend, or guarantee any listed business</li>
                <li>Process payments or facilitate transactions between users and businesses</li>
                <li>Provide customer service on behalf of listed businesses</li>
                <li>Assume responsibility for business operations, quality, or conduct</li>
              </ul>
              <p className="text-gray-700 leading-relaxed font-semibold">
                USE THIS PLATFORM AT YOUR OWN RISK. WE ARE NOT RESPONSIBLE FOR ANY CONSEQUENCES ARISING FROM YOUR
                USE OF THIS PLATFORM OR YOUR INTERACTIONS WITH LISTED BUSINESSES.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately
                upon posting to the platform. Your continued use of the platform after changes constitutes acceptance
                of the modified terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Use, please contact us at{' '}
                <a
                  href="mailto:drum-ice-scoundrel@duck.com"
                  className="text-primary hover:underline"
                >
                  drum-ice-scoundrel@duck.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
