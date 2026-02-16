import Link from "next/link";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/pricing", label: "Pricing" },
];

const resourceLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/api-reference", label: "API Reference" },
  { href: "/blog", label: "Blog" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <h2 className="text-white font-bold text-lg mb-2">
              Halo Protocol
            </h2>
            <p className="text-neutral-400 text-sm mb-6 max-w-xs">
              Decentralized lending circles with on-chain credit scoring on
              Solana.
            </p>
            <div className="flex items-center gap-4">
              {/* GitHub */}
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <FooterLinkColumn title="Product" links={productLinks} />
          <FooterLinkColumn title="Resources" links={resourceLinks} />
          <FooterLinkColumn title="Company" links={companyLinks} />
          <FooterLinkColumn title="Legal" links={legalLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; 2024 Halo Protocol. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">Built on Solana</p>
        </div>
      </div>
    </footer>
  );
}
