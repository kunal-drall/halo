import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Halo Protocol",
  description:
    "Privacy Policy for Halo Protocol — how we collect, use, and protect your information on our decentralized lending circle platform on Solana.",
};

export default function PrivacyPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Privacy Policy
          </h1>
          <p className="text-white/40 text-sm">
            Last updated: February 10, 2026
          </p>
        </div>

        {/* Privacy Content */}
        <div className="glass-card p-8 sm:p-12 space-y-10 text-white/60 leading-relaxed">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Introduction
            </h2>
            <p>
              Halo Protocol (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our decentralized lending circle platform,
              website, smart contracts, APIs, and related services (collectively,
              the &quot;Service&quot;).
            </p>
            <p className="mt-3">
              By using the Service, you agree to the collection and use of
              information in accordance with this Privacy Policy. If you do not
              agree with the terms of this Privacy Policy, please do not access
              or use the Service.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-semibold text-white/80 mb-3">
              Information You Provide
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-4 mb-4">
              <li>
                <strong className="text-white/80">Wallet Address:</strong> When
                you connect your Solana wallet, we receive your public wallet
                address. This serves as your identity on the platform.
              </li>
              <li>
                <strong className="text-white/80">Profile Information:</strong>{" "}
                If you choose to set a display name or avatar, this information
                is stored in our database.
              </li>
              <li>
                <strong className="text-white/80">
                  Contact Information:
                </strong>{" "}
                If you contact us via email or our contact form, we collect your
                name, email address, and message content.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-white/80 mb-3">
              Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong className="text-white/80">Usage Data:</strong> We may
                collect information about how you interact with the Service,
                including pages visited, features used, and time spent on the
                platform.
              </li>
              <li>
                <strong className="text-white/80">Device Information:</strong>{" "}
                Browser type, operating system, device type, and screen
                resolution.
              </li>
              <li>
                <strong className="text-white/80">IP Address:</strong> Your IP
                address may be collected for rate limiting, security monitoring,
                and abuse prevention.
              </li>
              <li>
                <strong className="text-white/80">Cookies:</strong> We use
                essential cookies only. See our{" "}
                <Link
                  href="/cookies"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Cookie Policy
                </Link>{" "}
                for details.
              </li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>
                Authenticate your wallet connection and manage your session
              </li>
              <li>
                Display your trust score, circle participation, and activity
                history
              </li>
              <li>
                Process and record on-chain transactions (contributions,
                payouts, trust score updates)
              </li>
              <li>Send notifications about circle deadlines and payouts</li>
              <li>
                Monitor for fraudulent activity, abuse, and violations of our
                Terms of Service
              </li>
              <li>Respond to your inquiries and support requests</li>
              <li>
                Analyze usage patterns to improve the user experience and
                protocol performance
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 4. Blockchain Data */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Blockchain Data
            </h2>
            <p>
              Halo Protocol operates on the Solana blockchain, which is a public,
              decentralized ledger. You acknowledge and understand that:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                All transactions, including contributions, payouts, trust score
                updates, and governance votes, are recorded permanently on the
                Solana blockchain
              </li>
              <li>
                Your wallet address, transaction history, and trust score are
                publicly visible to anyone inspecting the blockchain
              </li>
              <li>
                On-chain data cannot be modified or deleted once confirmed by
                the network
              </li>
              <li>
                We have no ability to remove or alter data recorded on the
                blockchain
              </li>
              <li>
                Third parties may independently index, analyze, or display
                on-chain data associated with your wallet address
              </li>
            </ul>
            <p className="mt-3">
              This is an inherent property of blockchain technology and is not
              specific to Halo Protocol. We encourage you to use a dedicated
              wallet for the Service if you wish to separate your Halo activity
              from other blockchain interactions.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Third-Party Services
            </h2>
            <p>
              We use the following third-party services to operate the platform:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                <strong className="text-white/80">Supabase:</strong> Database
                hosting for off-chain metadata and user profiles
              </li>
              <li>
                <strong className="text-white/80">Vercel:</strong> Frontend
                hosting and serverless API infrastructure
              </li>
              <li>
                <strong className="text-white/80">Helius:</strong> Solana RPC
                and webhook services for on-chain event processing
              </li>
              <li>
                <strong className="text-white/80">Upstash Redis:</strong>{" "}
                Caching and rate limiting
              </li>
              <li>
                <strong className="text-white/80">Sentry:</strong> Error
                monitoring and performance tracking
              </li>
            </ul>
            <p className="mt-3">
              Each of these services has its own privacy policy. We encourage you
              to review the privacy policies of these third-party providers. We
              share only the minimum data necessary for each service to function.
            </p>
          </section>

          {/* 6. Data Security */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                HMAC-signed session tokens with timing-safe verification
              </li>
              <li>
                Security headers (X-Frame-Options, X-Content-Type-Options,
                Referrer-Policy) on all API responses
              </li>
              <li>Rate limiting on API endpoints to prevent abuse</li>
              <li>Webhook signature verification for all inbound webhooks</li>
              <li>Encrypted data transmission via HTTPS/TLS</li>
              <li>
                Wallet address verification on all authenticated API endpoints
              </li>
            </ul>
            <p className="mt-3">
              While we strive to protect your information, no method of
              transmission over the internet or electronic storage is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 7. Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              7. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                <strong className="text-white/80">Access:</strong> Request a
                copy of the personal data we hold about you
              </li>
              <li>
                <strong className="text-white/80">Correction:</strong> Request
                correction of inaccurate or incomplete data
              </li>
              <li>
                <strong className="text-white/80">Deletion:</strong> Request
                deletion of your off-chain data (note: on-chain data cannot be
                deleted)
              </li>
              <li>
                <strong className="text-white/80">Portability:</strong> Request
                a machine-readable copy of your data
              </li>
              <li>
                <strong className="text-white/80">Objection:</strong> Object to
                certain processing of your data
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <Link
                href="mailto:privacy@haloprotocol.io"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                privacy@haloprotocol.io
              </Link>
              . We will respond to your request within 30 days.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed to individuals under the age of 18 (or
              the age of majority in your jurisdiction). We do not knowingly
              collect personal information from children. If we become aware that
              we have collected personal information from a child without
              verifiable parental consent, we will take steps to delete that
              information.
            </p>
          </section>

          {/* 9. International Transfers */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and maintained on servers
              located outside your country of residence. By using the Service,
              you consent to the transfer of your information to countries that
              may have different data protection laws than your jurisdiction.
            </p>
            <p className="mt-3">
              Additionally, because the Service operates on the Solana
              blockchain, which is a globally distributed network, on-chain data
              is replicated across validator nodes worldwide. This is inherent to
              blockchain technology.
            </p>
          </section>

          {/* 10. Data Retention */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              10. Data Retention
            </h2>
            <p>
              We retain your off-chain data for as long as your account is active
              or as needed to provide the Service. If you request deletion of your
              account, we will delete your off-chain data within 30 days, except
              where retention is required by law.
            </p>
            <p className="mt-3">
              On-chain data (transactions, trust scores, circle participation) is
              permanently stored on the Solana blockchain and cannot be deleted
              by us or any other party.
            </p>
          </section>

          {/* 11. Changes to This Policy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes by posting the updated Privacy Policy
              on this page and updating the &quot;Last updated&quot; date.
            </p>
            <p className="mt-3">
              Your continued use of the Service after any changes to this Privacy
              Policy constitutes acceptance of the updated policy. We encourage
              you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* 12. Contact Us */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              12. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                Email:{" "}
                <Link
                  href="mailto:privacy@haloprotocol.io"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  privacy@haloprotocol.io
                </Link>
              </li>
              <li>
                General inquiries:{" "}
                <Link
                  href="/contact"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Contact page
                </Link>
              </li>
            </ul>
            <p className="mt-6 text-white/40 text-sm">
              Effective Date: February 10, 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
