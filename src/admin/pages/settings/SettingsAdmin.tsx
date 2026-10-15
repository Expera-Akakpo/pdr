import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { MediaUploader } from '../../components/MediaUploader.tsx';

export const SettingsAdmin: React.FC = () => {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    hero_title: 'Pont des Deux Rives',
    hero_subtitle: 'Un voyage d\'apprentissage et de citoyenneté interculturelle',
    hero_intro: 'Pont des Deux Rives allie : engagement social, découverte interculturelle, famille d\'accueil et visites touristiques. Un voyage d\'apprentissage et d\'ouverture au monde.',
    hero_image: '/images/hero-pont-des-deux-rives.jpg',
    contact_address: 'Cité Arconville, Lot 643, Parcelle K-A2, ABOMEY-CALAVI, Bénin',
    contact_phone_primary: '+229 01 69 74 00 00',
    contact_phone_secondary: '+229 97 52 51 68',
    contact_email: 'progenbenin@gmail.com',
    cta_title: 'Prêt(e) à vivre l\'expérience Pont des Deux Rives ?',
    cta_subtitle: 'Les inscriptions pour la prochaine vague sont ouvertes. Rejoignez-nous.',
    social_facebook: 'https://facebook.com',
    social_linkedin: 'https://linkedin.com',
    social_instagram: 'https://instagram.com',
    social_whatsapp: '+2290169740000',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => addToast('Erreur de chargement des paramètres', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error();
      addToast('Paramètres généraux sauvegardés avec succès.', 'success');
    } catch {
      addToast('Erreur lors de la sauvegarde des paramètres.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      addToast('Le mot de passe doit comporter au moins 8 caractères.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast('Votre mot de passe a été modifié avec succès.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast(err.message || 'Erreur lors du changement de mot de passe.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-500">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#1B2A5E]">
          Paramètres du site & Coordonnées
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Textes d'accueil, coordonnées officielles et sécurité de votre compte administrateur.
        </p>
      </div>

      {/* FORMULAIRE 1 : PARAMÈTRES GÉNÉRAUX */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <h3 className="text-base font-bold text-[#1B2A5E] border-b pb-2">
          1. Textes clés du site public
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Titre principal du Héro
            </label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Sous-titre officiel (baseline)
            </label>
            <input
              type="text"
              value={settings.hero_subtitle || ''}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Paragraphe d'introduction
            </label>
            <textarea
              rows={3}
              value={settings.hero_intro || ''}
              onChange={(e) => setSettings({ ...settings, hero_intro: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-[#1B2A5E] border-b pb-2 pt-4">
          2. Coordonnées de ProGen Bénin
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Adresse physique du siège
            </label>
            <input
              type="text"
              value={settings.contact_address || ''}
              onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Téléphone principal (du flyer)
            </label>
            <input
              type="text"
              value={settings.contact_phone_primary || ''}
              onChange={(e) => setSettings({ ...settings, contact_phone_primary: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Téléphone secondaire
            </label>
            <input
              type="text"
              value={settings.contact_phone_secondary || ''}
              onChange={(e) => setSettings({ ...settings, contact_phone_secondary: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Courriel de contact officiel
            </label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-[#1B2A5E] border-b pb-2 pt-4">
          3. Bannière d'appel à l'action final (fond or)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Titre du CTA
            </label>
            <input
              type="text"
              value={settings.cta_title || ''}
              onChange={(e) => setSettings({ ...settings, cta_title: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Sous-titre du CTA
            </label>
            <input
              type="text"
              value={settings.cta_subtitle || ''}
              onChange={(e) => setSettings({ ...settings, cta_subtitle: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45] disabled:opacity-50"
          >
            {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres généraux'}
          </button>
        </div>
      </form>

      {/* FORMULAIRE 2 : SÉCURITÉ DU COMPTE / CHANGEMENT DE MOT DE PASSE */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#1B2A5E]">
            Sécurité — Modifier votre mot de passe
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Connecté en tant que <strong>{user?.email}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min. 8 caractères"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45] disabled:opacity-50"
          >
            {savingPassword ? 'Modification...' : 'Modifier mon mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
};
