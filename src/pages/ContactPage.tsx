import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { CheckCircle2, Send } from "lucide-react";

export function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      if (res.ok) { setFormState("success"); form.reset(); }
      else setFormState("error");
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t('contact_title')}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('contact_subtitle')}</p>
      </div>

      {/* Author card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 p-6 sm:p-8 text-center">
        <img
          src={`${import.meta.env.BASE_URL}avatar.png`}
          alt="Ulrich Djidonou"
          className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md mx-auto mb-4 hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            // Fallback if avatar image missing
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <a
          href="https://www.linkedin.com/in/ulrichdjidonou"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-[#0A66C2] dark:hover:text-[#38bdf8] transition-colors mb-1 font-display"
        >
          Ulrich Djidonou
        </a>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-md mx-auto">
          Économiste-chercheur &bull; Inférence causale, machine learning et analyse de politiques publiques comparées.
        </p>
        <a
          href="https://www.linkedin.com/in/ulrichdjidonou"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#0A66C2] dark:border-[#38bdf8] text-[#0A66C2] dark:text-[#38bdf8] text-xs sm:text-sm font-semibold rounded-full hover:bg-[#0A66C2] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-slate-900 transition-all shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Profil LinkedIn
        </a>
      </div>

      {/* Contact form card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        {formState === "success" ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('contact_success_title')}</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('contact_success_desc')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="access_key" value="da693226-0295-4deb-899c-452462a3537b" />
            <input type="hidden" name="subject" value="Message depuis Leave Network Explorer" />
            <input type="hidden" name="from_name" value="Leave Network Explorer" />
            <input type="checkbox" name="botcheck" style={{ display: "none" }} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-name">
                {t('contact_name')}
              </label>
              <input
                id="contact-name" type="text" name="name"
                placeholder={t('contact_name_placeholder')} required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-email">
                {t('contact_email')}
              </label>
              <input
                id="contact-email" type="email" name="email"
                placeholder={t('contact_email_placeholder')} required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-message">
                {t('contact_message')}
              </label>
              <textarea
                id="contact-message" name="message" rows={4}
                placeholder={t('contact_message_placeholder')} required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none shadow-xs"
              />
            </div>

            <button
              type="submit" disabled={formState === "sending"}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {formState === "sending" ? t('contact_sending') : t('contact_send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
