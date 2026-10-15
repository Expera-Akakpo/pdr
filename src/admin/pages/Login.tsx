import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_BASE_PATH } from '../config.ts';
import { Logo } from '../../components/Logo.tsx';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(ADMIN_BASE_PATH);
    } else {
      setError(result.error || 'Erreur d\'authentification.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1A1A1A]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo variant="dark" showSubtitle={true} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1B2A5E]">
          Console d'Administration
        </h2>
        <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">
          Espace réservé à l'équipe ProGen Bénin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl border border-gray-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                Adresse e-mail
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@progenbenin.org"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#E6B325] focus:ring-1 focus:ring-[#E6B325] outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded font-bold text-sm bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter à la console'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            Accès sécurisé réservé aux administrateurs mandatés.
          </div>
        </div>
      </div>
    </div>
  );
};
