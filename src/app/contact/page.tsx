"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");
    trackEvent("submit_contact_form", { subject: subject || "General" });

    try {
      const [apiRes] = await Promise.allSettled([
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message }),
        }),
        fetch("https://formsubmit.co/ajax/filmfer@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            _replyto: email,
            _subject: `[EVRS neovolt.app] ${subject || "Novo Contacto"} — ${name}`,
            message,
            _captcha: "false",
          }),
        }),
      ]);

      if (apiRes.status === "fulfilled" && apiRes.value.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 mt-6 mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
            ✉️ {t("contact_badge")}
          </span>
          <h1 className="text-3xl font-bold text-white">{t("contact_title")}</h1>
        </div>
        <Link href="/" className="px-4 py-2 border border-border rounded-lg bg-card hover:bg-border transition text-sm">
          {t("new_search")}
        </Link>
      </div>

      <div className="glow-card p-6 md:p-8 rounded-2xl bg-card/80 border border-border">
        <p className="text-sm text-gray-400 mb-6">{t("contact_subtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t("contact_name_label")} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("contact_name_placeholder")}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-white placeholder-gray-500 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                {t("contact_email_label")} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("contact_email_placeholder")}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-white placeholder-gray-500 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {t("contact_subject_label")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("contact_subject_placeholder")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-white placeholder-gray-500 focus:border-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {t("contact_message_label")} *
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("contact_message_placeholder")}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-white placeholder-gray-500 focus:border-primary outline-none transition resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-emerald-600 disabled:opacity-50 text-primary-foreground font-semibold text-sm transition cursor-pointer"
            >
              {status === "sending" ? t("contact_sending") : t("contact_submit_btn")}
            </button>

            {status === "success" && (
              <span className="text-xs font-medium text-emerald-400">
                ✅ {t("contact_success_msg")}
              </span>
            )}

            {status === "error" && (
              <span className="text-xs font-medium text-red-400">
                ❌ {t("contact_error_msg")}{" "}
                <a href="mailto:filmfer@gmail.com" className="underline">
                  filmfer@gmail.com
                </a>
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
