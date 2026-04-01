import { useState } from "react";

export function AboutPage() {
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        setFormState("success");
        form.reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

      {/* Author card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        {/* Avatar */}
        <div className="w-28 h-28 bg-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 select-none">
          UD
        </div>
        <a
          href="https://www.linkedin.com/in/ulrichdjidonou"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xl font-bold text-slate-900 hover:text-[#0A66C2] transition-colors mb-1"
        >
          Ulrich Djidonou
        </a>
        <p className="text-sm text-slate-500 leading-relaxed mb-5">
          Economist | 6+ years advising senior leaders on evidence-based strategy |
          Causal Inference &middot; ML &middot; AI
        </p>
        <a
          href="https://www.linkedin.com/in/ulrichdjidonou"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full hover:bg-[#0A66C2] hover:text-white transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
      </div>

      {/* About the project */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">À propos du projet</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ce tableau de bord interactif visualise les données de la{" "}
          <strong>International Review of Leave Policies and Research</strong> publiée chaque
          année en septembre par le Leave Network (LPRN). La version actuelle couvre les
          politiques en vigueur en <strong>avril 2025</strong>, incluant 52 pays et plus de
          60 entités infranationales (provinces, états, cantons).
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <strong>Source :</strong> Dobrotic et al. (2025).{" "}
            <em>International Review of Leave Policies and Research 2025</em>. Leave Network.
          </p>
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Me contacter</h3>
        <p className="text-sm text-slate-500 mb-6">
          Pour toute question, envoyez, s'il vous plaît, votre message.
        </p>

        {formState === "success" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-slate-800 mb-1">Message envoyé !</h4>
            <p className="text-sm text-slate-500">Merci. Je vous répondrai dans les meilleurs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="access_key" value="da693226-0295-4deb-899c-452462a3537b" />
            <input type="hidden" name="subject" value="Message depuis Leave Network Explorer" />
            <input type="hidden" name="from_name" value="Leave Network Explorer" />
            <input type="checkbox" name="botcheck" style={{ display: "none" }} />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="contact-name">
                Nom
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Votre nom"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="contact-email">
                Courriel
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="votre@courriel.com"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Votre question ou commentaire..."
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition resize-none"
              />
            </div>

            {formState === "error" && (
              <p className="text-sm text-red-600">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            )}

            <button
              type="submit"
              disabled={formState === "sending"}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {formState === "sending" ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
