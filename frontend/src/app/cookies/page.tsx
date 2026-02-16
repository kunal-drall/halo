import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | Halo Protocol",
  description:
    "Cookie Policy for Halo Protocol — we use essential cookies only. Learn what cookies are and how we use them.",
};

export default function CookiesPage() {
  return (
    <div className="relative pt-28 pb-20 px-4">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
            Cookie Policy
          </h1>
          <p className="text-white/40 text-sm">
            Last updated: February 10, 2026
          </p>
        </div>

        {/* Cookie Content */}
        <div className="glass-card p-8 sm:p-12 space-y-10 text-white/60 leading-relaxed">
          {/* 1. What Are Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files that are placed on your device
              (computer, tablet, or smartphone) when you visit a website. They
              are widely used to make websites work more efficiently, provide a
              better user experience, and give site owners information about how
              their site is being used.
            </p>
            <p className="mt-3">
              Cookies can be &quot;session&quot; cookies (which expire when you
              close your browser) or &quot;persistent&quot; cookies (which remain
              on your device for a set period or until you delete them).
            </p>
          </section>

          {/* 2. Types of Cookies We Use */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              2. Types of Cookies We Use
            </h2>
            <p className="mb-4">
              <strong className="text-white">
                Halo Protocol uses essential cookies only.
              </strong>{" "}
              We do not use advertising, analytics, or tracking cookies. We do
              not serve ads and do not track your behavior across other websites.
            </p>

            <div className="bg-white/[0.03] rounded-lg p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white/80 mb-3">
                Essential Cookies
              </h3>
              <p className="mb-4">
                These cookies are strictly necessary for the Service to function.
                They cannot be disabled without breaking core functionality.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-4 text-white/40 font-medium">
                        Cookie
                      </th>
                      <th className="py-2 pr-4 text-white/40 font-medium">
                        Purpose
                      </th>
                      <th className="py-2 text-white/40 font-medium">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-violet-400 text-xs">
                        halo_session
                      </td>
                      <td className="py-3 pr-4">
                        Stores your HMAC-signed session token after wallet
                        connection. Used to authenticate API requests.
                      </td>
                      <td className="py-3 text-white/40">Session</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-violet-400 text-xs">
                        wallet_connected
                      </td>
                      <td className="py-3 pr-4">
                        Remembers that you have previously connected a wallet so
                        the app can attempt auto-reconnection on your next visit.
                      </td>
                      <td className="py-3 text-white/40">30 days</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-violet-400 text-xs">
                        theme_pref
                      </td>
                      <td className="py-3 pr-4">
                        Stores your theme preference (dark mode). Currently the
                        Service is dark mode only.
                      </td>
                      <td className="py-3 text-white/40">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 3. How to Control Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              3. How to Control Cookies
            </h2>
            <p>
              You can control and manage cookies through your browser settings.
              Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>View which cookies are stored on your device</li>
              <li>Delete specific cookies or all cookies</li>
              <li>Block cookies from specific sites or all sites</li>
              <li>
                Set preferences for first-party vs. third-party cookies
              </li>
            </ul>
            <p className="mt-3">
              Please note that blocking or deleting essential cookies may
              prevent the Service from functioning correctly. Specifically,
              deleting your session cookie will require you to reconnect your
              wallet.
            </p>
            <p className="mt-3">
              For instructions on how to manage cookies in your browser:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>Chrome: Settings &gt; Privacy and Security &gt; Cookies</li>
              <li>Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies</li>
              <li>
                Safari: Preferences &gt; Privacy &gt; Manage Website Data
              </li>
              <li>
                Edge: Settings &gt; Cookies and Site Permissions &gt; Cookies
              </li>
            </ul>
          </section>

          {/* 4. Third-Party Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              4. Third-Party Cookies
            </h2>
            <p>
              Halo Protocol does not set third-party cookies. We do not use
              third-party analytics services (such as Google Analytics), advertising
              networks, or social media tracking pixels.
            </p>
            <p className="mt-3">
              However, if you interact with third-party services linked from
              our site (such as GitHub, Twitter, or Telegram), those services may
              set their own cookies according to their own privacy policies. We
              have no control over cookies set by third-party sites.
            </p>
          </section>

          {/* 5. Local Storage and Session Storage */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              5. Local Storage and Session Storage
            </h2>
            <p>
              In addition to cookies, the Service uses browser Local Storage and
              Session Storage for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 pl-4">
              <li>
                <strong className="text-white/80">Wallet adapter state:</strong>{" "}
                Remembers which wallet provider you last connected with
              </li>
              <li>
                <strong className="text-white/80">UI preferences:</strong>{" "}
                Stores user interface settings such as dismissed notifications
              </li>
              <li>
                <strong className="text-white/80">Zustand stores:</strong>{" "}
                Caches application state for faster page loads
              </li>
            </ul>
            <p className="mt-3">
              Local Storage and Session Storage data is stored only in your
              browser and is not transmitted to our servers. You can clear this
              data through your browser settings.
            </p>
          </section>

          {/* 6. Service Workers */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              6. Service Workers
            </h2>
            <p>
              Halo Protocol is a Progressive Web App (PWA) and registers a
              service worker for offline support and caching. The service worker
              caches static assets (HTML, CSS, JavaScript, images) to enable
              offline access and faster page loads. The service worker does not
              track your behavior or send data to our servers.
            </p>
            <p className="mt-3">
              You can unregister the service worker through your browser&apos;s
              developer tools (Application &gt; Service Workers &gt;
              Unregister).
            </p>
          </section>

          {/* 7. Updates to This Policy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              7. Updates to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. If we make
              material changes (such as introducing non-essential cookies), we
              will notify you by updating the &quot;Last updated&quot; date and, if
              required by law, requesting your consent before setting
              non-essential cookies.
            </p>
          </section>

          {/* 8. Contact Us */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Cookie Policy, please contact
              us:
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
          </section>
        </div>
      </div>
    </div>
  );
}
