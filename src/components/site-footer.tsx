import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { Brand } from "@/components/brand";

const COLUMNS = [
  {
    title: "Create",
    links: [
      { href: "/text-to-video", label: "Text to Video" },
      { href: "/image-to-video", label: "Image to Video" },
      { href: "/cartoon-video", label: "Cartoon Maker" },
      { href: "/voice", label: "AI Voice" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/my-videos", label: "My Videos" },
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/admin", label: "Admin" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0a0816]/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Create Amazing Videos with AI. Turn a sentence or a photo into a
              polished clip — with Hindi and English voice over.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-200/90">
              <span className="size-1.5 rounded-full bg-amber-300" />
              Demo preview — no real AI renders yet
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Instagram, Youtube].map((Icon, index) => (
                <span
                  key={index}
                  className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Misty AI. All rights reserved.</p>
          <p>
            Built for Android-first creators ·{" "}
            <span className="text-white/60">Made in India</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
