import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Halo Protocol",
  description:
    "Terms of Service for Halo Protocol — decentralized lending circles with on-chain credit scoring on Solana.",
};

export default function TermsPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Terms of Service
          </h1>
          <p className="text-white/40 text-sm">
            Last updated: February 10, 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="glass-card p-8 sm:p-12 space-y-10 text-white/60 leading-relaxed">
          {/* 1. Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Halo Protocol platform, website, smart
              contracts, APIs, or any related services (collectively, the
              &quot;Service&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to all of these Terms, you
              must not access or use the Service. These Terms constitute a legally
              binding agreement between you and Halo Protocol (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. Your
              continued use of the Service after any modifications constitutes
              acceptance of the updated Terms. It is your responsibility to review
              these Terms periodically.
            </p>
          </section>

          {/* 2. Description */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. Description of Service
            </h2>
            <p>
              Halo Protocol is a decentralized protocol built on the Solana
              blockchain that enables users to create and participate in lending
              circles (Rotating Savings and Credit Associations, or ROSCAs). The
              Service includes smart contracts deployed on Solana, a web-based
              frontend application, REST APIs, and related developer tools.
            </p>
            <p className="mt-3">
              The Service facilitates the formation of lending circles where
              participants contribute funds to a shared escrow each round, with one
              member receiving the pooled amount on a rotating basis. The Service
              also includes an on-chain trust scoring system, insurance pools,
              governance mechanisms, and yield generation through DeFi integrations.
            </p>
          </section>

          {/* 3. Eligibility */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. Eligibility
            </h2>
            <p>
              You must be at least 18 years of age (or the age of majority in your
              jurisdiction) to use the Service. By using the Service, you represent
              and warrant that you meet this age requirement and have the legal
              capacity to enter into these Terms.
            </p>
            <p className="mt-3">
              You are responsible for ensuring that your use of the Service
              complies with all applicable laws and regulations in your
              jurisdiction. The Service may not be available in all jurisdictions,
              and we make no representations that the Service is appropriate or
              available for use in any particular location.
            </p>
          </section>

          {/* 4. Account Registration */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Account Registration
            </h2>
            <p>
              To use certain features of the Service, you must connect a
              Solana-compatible wallet (such as Phantom, Solflare, or Ledger).
              Your wallet address serves as your identity on the platform. You are
              solely responsible for maintaining the security of your wallet,
              private keys, and seed phrases.
            </p>
            <p className="mt-3">
              We do not have access to your private keys, seed phrases, or wallet
              funds. We cannot recover lost wallets or reverse transactions. You
              acknowledge that loss of your wallet credentials may result in
              permanent loss of access to your funds and trust score.
            </p>
          </section>

          {/* 5. Use of Service */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Use of the Service
            </h2>
            <p>
              You may use the Service to create and join lending circles,
              contribute to shared escrow accounts, receive payout distributions,
              build and manage your on-chain trust score, participate in circle
              governance, and access yield generated by DeFi integrations.
            </p>
            <p className="mt-3">
              You agree to use the Service only for its intended purposes and in
              compliance with these Terms. You are responsible for all activity
              that occurs through your wallet connection, whether or not authorized
              by you.
            </p>
          </section>

          {/* 6. Prohibited Activities */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Prohibited Activities
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                Use the Service for money laundering, terrorist financing, or any
                other illegal activity
              </li>
              <li>
                Manipulate or attempt to manipulate trust scores through
                fraudulent activity, collusion, or sybil attacks
              </li>
              <li>
                Exploit vulnerabilities in smart contracts, APIs, or
                infrastructure for unauthorized gain
              </li>
              <li>
                Interfere with or disrupt the Service, servers, or networks
                connected to the Service
              </li>
              <li>
                Impersonate any person or entity, or falsely state or
                misrepresent your affiliation with any person or entity
              </li>
              <li>
                Use bots, scripts, or automated systems to interact with the
                Service in ways that violate these Terms
              </li>
              <li>
                Circumvent any rate limiting, access controls, or security
                measures implemented by the Service
              </li>
              <li>
                Create multiple accounts or wallets for the purpose of
                manipulating circles or trust scores
              </li>
            </ul>
          </section>

          {/* 7. Smart Contract Risk */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              7. Smart Contract Risks
            </h2>
            <p>
              The Service relies on smart contracts deployed on the Solana
              blockchain. While we make reasonable efforts to ensure the security
              and correctness of our smart contracts, you acknowledge and accept
              the following risks:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                Smart contracts may contain bugs, vulnerabilities, or unexpected
                behavior that could result in loss of funds
              </li>
              <li>
                The Solana blockchain may experience network congestion,
                downtime, or consensus failures
              </li>
              <li>
                Transactions on the Solana blockchain are irreversible once
                confirmed
              </li>
              <li>
                DeFi integrations for yield generation carry additional risk
                including smart contract risk, liquidity risk, and market risk
              </li>
              <li>
                Protocol upgrades or migrations may affect existing circles,
                escrow accounts, or trust scores
              </li>
              <li>
                Regulatory changes may affect the availability or legality of
                the Service in your jurisdiction
              </li>
            </ul>
            <p className="mt-3">
              You agree to use the Service at your own risk and to not deposit
              more funds than you can afford to lose.
            </p>
          </section>

          {/* 8. Fees */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Fees</h2>
            <p>
              The Service is free to use. However, the following fees apply to
              protocol operations:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                <strong className="text-white/80">Distribution Fee:</strong>{" "}
                0.5% on each payout distribution
              </li>
              <li>
                <strong className="text-white/80">Yield Fee:</strong> 0.25% on
                yield generated from DeFi integrations
              </li>
              <li>
                <strong className="text-white/80">Management Fee:</strong> 2%
                annual fee on active circle balances
              </li>
              <li>
                <strong className="text-white/80">Gas Fees:</strong> Solana
                network transaction fees (typically under $0.01 per transaction)
              </li>
            </ul>
            <p className="mt-3">
              Fee parameters are governed by the protocol&apos;s revenue_params
              account on-chain and may be adjusted through governance. We will
              provide reasonable notice before any fee changes take effect.
            </p>
          </section>

          {/* 9. Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              9. Intellectual Property
            </h2>
            <p>
              The Halo Protocol smart contracts and frontend application are
              released as open-source software. The specific license terms
              governing the source code are stated in the project repository.
            </p>
            <p className="mt-3">
              The Halo Protocol name, logo, brand assets, and trademarks are the
              property of Halo Protocol and may not be used without prior written
              permission. Nothing in these Terms grants you any right to use our
              trademarks, service marks, or trade names.
            </p>
          </section>

          {/* 10. Privacy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your information.
              By using the Service, you consent to the practices described in the
              Privacy Policy.
            </p>
            <p className="mt-3">
              You acknowledge that transactions on the Solana blockchain are
              publicly visible and that your wallet address, transaction history,
              trust score, and circle participation are recorded on a public
              ledger.
            </p>
          </section>

          {/* 11. Disclaimers */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              11. Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              We do not warrant that the Service will be uninterrupted, secure,
              or error-free, that defects will be corrected, or that the Service
              is free of viruses or other harmful components. We do not guarantee
              any specific results from using the Service, including but not
              limited to any specific trust score, yield, or financial outcome.
            </p>
            <p className="mt-3">
              Halo Protocol is not a bank, financial advisor, broker, or
              registered investment advisor. Nothing in the Service constitutes
              financial advice, investment advice, or a recommendation to engage in
              any particular transaction.
            </p>
          </section>

          {/* 12. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              12. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL HALO PROTOCOL, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS,
              OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, FUNDS, GOODWILL, OR OTHER INTANGIBLE LOSSES,
              RESULTING FROM:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>Your access to or use of (or inability to use) the Service</li>
              <li>
                Any conduct or content of any third party on or through the
                Service
              </li>
              <li>
                Unauthorized access, use, or alteration of your transmissions or
                content
              </li>
              <li>
                Smart contract bugs, exploits, or vulnerabilities
              </li>
              <li>
                Loss of funds deposited into circles, escrow, or yield protocols
              </li>
              <li>Blockchain network failures, congestion, or forks</li>
            </ul>
          </section>

          {/* 13. Indemnification */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              13. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Halo Protocol, its
              affiliates, officers, directors, employees, agents, and licensors
              from and against any claims, liabilities, damages, losses, and
              expenses (including reasonable attorneys&apos; fees) arising out of or in
              connection with your use of the Service, your violation of these
              Terms, or your violation of any rights of another party.
            </p>
          </section>

          {/* 14. Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              14. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Halo Protocol is organized,
              without regard to its conflict of law provisions. Any disputes
              arising from these Terms or your use of the Service shall be resolved
              through binding arbitration in accordance with the rules of a
              recognized arbitration body. You agree to waive any right to a jury
              trial or to participate in a class action lawsuit.
            </p>
          </section>

          {/* 15. Changes to Terms */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              15. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify users of material changes by posting the updated Terms on this
              page and updating the &quot;Last updated&quot; date. Changes become
              effective immediately upon posting.
            </p>
            <p className="mt-3">
              Your continued use of the Service after changes are posted
              constitutes acceptance of the updated Terms. If you do not agree to
              the updated Terms, you must stop using the Service.
            </p>
            <p className="mt-3">
              If you have questions about these Terms, please contact us at{" "}
              <Link
                href="mailto:legal@haloprotocol.io"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                legal@haloprotocol.io
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
