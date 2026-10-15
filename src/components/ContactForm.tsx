import React, { useState } from 'react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    subject: 'Demande d\'information générale',
    message: '',
    copyMe: false,
    newsletter: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    'Demande d\'information générale',
    'Inscription au programme',
    'Bénévolat',
    'Partenariat',
    'Presse',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          subject: formData.subject,
          message: formData.message,
          newsletter_optin: formData.newsletter
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de votre message.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-lg p-6 sm:p-8 text-left">
        <div className="w-10 h-10 rounded-full bg-[#2E7D5B] text-white flex items-center justify-center mb-3">
          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#2E7D5B] mb-2">
          Message transmis avec succès
        </h3>
        <p className="text-sm text-[#1A1A1A] leading-relaxed mb-4">
          Merci pour votre prise de contact. L'équipe ProGen Bénin a bien reçu votre demande et vous répondra sous 48 heures ouvrées par courrier électronique.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              country: '',
              subject: 'Demande d\'information générale',
              message: '',
              copyMe: false,
              newsletter: false,
            });
          }}
          className="text-xs font-semibold text-[#1B2A5E] hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-4">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="contact-name" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
          Nom et prénom <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex. Aïcha Traoré"
          className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-email" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Adresse e-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="nom@exemple.com"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Téléphone / WhatsApp
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+229 ... ou +33 ..."
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-country" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Pays de résidence
          </label>
          <input
            id="contact-country"
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="Ex. France, Tunisie, Bénin, Canada..."
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Objet de la demande <span className="text-red-500">*</span>
          </label>
          <select
            id="contact-subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none bg-white"
          >
            {subjects.map((sub, idx) => (
              <option key={idx} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
          Votre message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Détaillez votre question, votre profil ou votre projet d'engagement..."
          className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-md focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none resize-vertical"
        />
      </div>

      <div className="space-y-2 pt-1 text-xs text-[#4A4A4A]">
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.copyMe}
            onChange={(e) => setFormData({ ...formData, copyMe: e.target.checked })}
            className="mt-0.5 rounded text-[#1B2A5E] focus:ring-[#E6B325]"
          />
          <span>Je souhaite recevoir une copie de mon message sur mon e-mail.</span>
        </label>
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.newsletter}
            onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
            className="mt-0.5 rounded text-[#1B2A5E] focus:ring-[#E6B325]"
          />
          <span>Je souhaite m'inscrire aux actualités et prochaines vagues du programme.</span>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-7 py-3 rounded-md font-bold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors duration-150 shadow-sm disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </div>
    </form>
  );
};
