"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 mt-6 mb-16 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full bg-primary/15 text-primary border border-primary/30 mb-2">
            ⚡ {t("about_badge")}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t("about_title")}
          </h1>
        </div>
        <Link
          href="/"
          className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm"
        >
          {t("new_search")}
        </Link>
      </div>

      {/* Author Card: Filipe Fernandes & jfilipefernandes.com */}
      <div className="glow-card p-6 md:p-8 rounded-2xl bg-card/80 border border-border space-y-6">
        <p className="text-base text-gray-200 leading-relaxed">
          {t("about_p1")}
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          {t("about_p2")}
        </p>

        <div className="pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500 block">
              {t("about_creator_label")}
            </span>
            <span className="text-lg font-bold text-white">
              Filipe Fernandes
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://jfilipefernandes.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("click_author_website", {
                  url: "https://jfilipefernandes.com",
                })
              }
              className="py-2.5 px-5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 font-semibold text-xs flex items-center gap-2 transition"
            >
              <span>🌐 {t("about_website_cta")}: jfilipefernandes.com</span>
              <span>↗</span>
            </a>
            <Link
              href="/contact"
              className="py-2.5 px-5 rounded-xl bg-card hover:bg-border text-white border border-border font-semibold text-xs flex items-center gap-2 transition"
            >
              <span>✉️ {t("nav_contact")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("methodology_title")}</h2>
          <p className="text-sm text-gray-400 mt-1">{t("methodology_subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
            <h3 className="text-sm font-semibold text-emerald-400 mb-1.5">
              {t("methodology_card1_title")}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("methodology_card1_desc")}
            </p>
          </div>
          <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
            <h3 className="text-sm font-semibold text-blue-400 mb-1.5">
              {t("methodology_card2_title")}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("methodology_card2_desc")}
            </p>
          </div>
          <div className="glow-card p-5 rounded-2xl bg-card/70 border border-border">
            <h3 className="text-sm font-semibold text-orange-400 mb-1.5">
              {t("methodology_card3_title")}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("methodology_card3_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">{t("faq_title")}</h2>
        <div className="space-y-3">
          <details className="group p-4 rounded-xl bg-card/60 border border-border">
            <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
              <span>{t("faq_q1")}</span>
              <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a1")}</p>
          </details>
          <details className="group p-4 rounded-xl bg-card/60 border border-border">
            <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
              <span>{t("faq_q2")}</span>
              <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a2")}</p>
          </details>
          <details className="group p-4 rounded-xl bg-card/60 border border-border">
            <summary className="cursor-pointer font-semibold text-sm text-white flex items-center justify-between">
              <span>{t("faq_q3")}</span>
              <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">{t("faq_a3")}</p>
          </details>
        </div>
      </section>
    </main>
  );
}
