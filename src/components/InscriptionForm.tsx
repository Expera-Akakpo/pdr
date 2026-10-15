import React, { useState } from 'react';

export const InscriptionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    age: '',
    motivation: '',
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Les champs prénom, nom et adresse e-mail sont obligatoires.');
      return;
    }

    if (formData.motivation.trim().length < 20) {
      setError('Veuillez indiquer quelques phrases sur votre motivation (au moins 20 caractères).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          age: formData.age ? parseInt(formData.age, 10) : null,
          motivation: formData.motivation,
          consent_contact: formData.consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement de votre inscription.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de votre candidature.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div id="inscription" className="bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl p-6 sm:p-10 text-left">
        <div className="w-12 h-12 rounded-full bg-[#2E7D5B] text-white flex items-center justify-center mb-4">
          <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#1B2A5E] mb-2">
          Intention d'inscription enregistrée !
        </h3>
        <p className="text-sm sm:text-base text-[#1A1A1A] leading-relaxed mb-4">
          Félicitations pour votre engagement. Votre dossier a été pris en compte pour la prochaine vague du programme <strong>Pont des Deux Rives</strong>. Un coordinateur ProGen Bénin prendra contact avec vous sous 48 heures pour convenir de l'entretien préalable et vous transmettre le dossier d'accueil complet.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                country: '',
                age: '',
                motivation: '',
                consent: true,
              });
            }}
            className="text-xs font-bold text-[#1B2A5E] hover:underline uppercase tracking-wider"
          >
            Enregistrer une autre candidature
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="inscription" className="bg-[#FDF6E3] border border-[#F2E3C6] rounded-xl p-6 sm:p-10 shadow-sm scroll-mt-24">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
          Candidature & Volontariat
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#1B2A5E] mt-1">
          Inscription rapide — Pont des Deux Rives
        </h3>
        <p className="text-sm text-[#4A4A4A] mt-1">
          Remplissez ce formulaire pour postuler à la prochaine vague d'immersion au Bénin.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insc-firstname" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              id="insc-firstname"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Ex. Samuel"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
          <div>
            <label htmlFor="insc-lastname" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Nom de famille <span className="text-red-500">*</span>
            </label>
            <input
              id="insc-lastname"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Ex. Dupont"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insc-email" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Adresse e-mail <span className="text-red-500">*</span>
            </label>
            <input
              id="insc-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="samuel@exemple.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
          <div>
            <label htmlFor="insc-phone" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Téléphone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="insc-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 ... ou +229 ..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insc-country" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Pays d'origine ou de résidence <span className="text-red-500">*</span>
            </label>
            <input
              id="insc-country"
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Ex. Tunisie, France, Bénin, Belgique..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
          <div>
            <label htmlFor="insc-age" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Âge (programme ouvert en priorité aux 16 - 30 ans)
            </label>
            <input
              id="insc-age"
              type="number"
              min="14"
              max="99"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Ex. 22"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="insc-motivation" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Vos motivations & attentes pour ce séjour <span className="text-red-500">*</span>
          </label>
          <textarea
            id="insc-motivation"
            required
            rows={4}
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            placeholder="Pourquoi souhaitez-vous rejoindre le Pont des Deux Rives ? Quels sont vos domaines d'intérêt (éducation, santé, culture, artisanat) ?"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none resize-vertical"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-[#4A4A4A]">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-0.5 rounded text-[#1B2A5E] focus:ring-[#E6B325]"
            />
            <span>J'accepte d'être recontacté(e) par l'équipe ProGen Bénin dans le cadre de ma démarche de candidature.</span>
          </label>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-sm bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Traitement en cours...' : 'Envoyer ma demande d\'inscription'}
          </button>
          <p className="text-xs text-gray-500 italic text-left">
            Ce formulaire enregistre votre intention d'inscription. Un membre de l'équipe vous contactera sous 48 h.
          </p>
        </div>
      </form>
    </div>
  );
};
