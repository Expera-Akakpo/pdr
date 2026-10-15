import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editeur';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export const UsersAdmin: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserRecord | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editeur' as 'admin' | 'editeur',
  });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => addToast('Erreur de chargement des utilisateurs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Tous les champs sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast('Utilisateur créé avec succès.', 'success');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'editeur' });
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la création.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || newPassword.length < 8) {
      addToast('Le mot de passe doit comporter au moins 8 caractères.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) throw new Error();
      addToast('Mot de passe réinitialisé.', 'success');
      setResetTarget(null);
      setNewPassword('');
    } catch {
      addToast('Erreur de réinitialisation.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserActive = async (target: AdminUserRecord) => {
    if (target.id === currentUser?.id) {
      addToast('Vous ne pouvez pas désactiver votre propre compte.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${target.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !target.is_active }),
      });

      if (!res.ok) throw new Error();
      addToast(target.is_active ? 'Compte désactivé.' : 'Compte réactivé.', 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch {
      addToast('Erreur lors de la modification.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Compte supprimé.', 'success');
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      } else {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Gestion des utilisateurs administrateurs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Comptes habilités à administrer la plateforme et ses modules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors"
        >
          + Créer un compte
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Dernière connexion</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 text-[10px] text-[#E6B325] font-bold">(Vous)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-[#1B2A5E] text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                        {u.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword('');
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-medium"
                      >
                        Nouveau MDP
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleUserActive(u)}
                        disabled={u.id === currentUser?.id}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-medium disabled:opacity-40"
                      >
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === currentUser?.id}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-medium disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Créer utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              Créer un nouvel administrateur
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ex. Christian Agossou"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="nom@progenbenin.org"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Mot de passe provisoire <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 8 caractères"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Rôle & Droits
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full text-sm px-3 py-2 border rounded bg-white"
                >
                  <option value="editeur">Éditeur (gestion des contenus)</option>
                  <option value="admin">Administrateur (gestion totale + utilisateurs)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
                >
                  {saving ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réinitialiser mot de passe */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#1B2A5E] mb-2">
              Réinitialiser le mot de passe
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Pour le compte de <strong>{resetTarget.name}</strong> ({resetTarget.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-3 py-1.5 border rounded text-xs font-semibold text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer l'utilisateur"
        message="Êtes-vous certain de vouloir supprimer cet utilisateur ?"
        itemName={deleteTarget?.name}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
