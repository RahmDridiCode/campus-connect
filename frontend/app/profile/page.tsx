'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { errorMessage } from '@/types/app';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded';
const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [studyLevel, setStudyLevel] = useState('BACHELOR');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [availabilities, setAvailabilities] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Pré-remplit le formulaire avec les données de l'utilisateur connecté
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setSpecialty(user.specialty ?? '');
    setStudyLevel(user.studyLevel);
    setBio(user.bio ?? '');
    setSkills(user.skills.join(', '));
    setAvailabilities((user.availabilities ?? []).join(', '));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        fullName,
        specialty,
        studyLevel: studyLevel as any,
        bio,
        skills: toList(skills),
        availabilities: toList(availabilities),
      } as any);
      setMessage({ ok: true, text: 'Profil mis à jour' });
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err, (err as Error).message) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Mon profil</h1>
        <p className="text-sm text-gray-600 mb-4">
          {user?.email} — rôle : {user?.role}
        </p>

        {message && (
          <div
            role="status"
            className={`p-3 rounded mb-4 ${message.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              id="fullName"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium mb-1">
              Spécialité
            </label>
            <input
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="studyLevel" className="block text-sm font-medium mb-1">
              Niveau d'études
            </label>
            <select
              id="studyLevel"
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value)}
              className={inputClass}
            >
              <option value="BACHELOR">Licence</option>
              <option value="MASTER">Master</option>
              <option value="PHD">Doctorat</option>
            </select>
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-1">
              Compétences (séparées par des virgules)
            </label>
            <input
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={inputClass}
              placeholder="Java, SQL, React"
            />
          </div>
          <div>
            <label htmlFor="availabilities" className="block text-sm font-medium mb-1">
              Disponibilités (séparées par des virgules)
            </label>
            <input
              id="availabilities"
              value={availabilities}
              onChange={(e) => setAvailabilities(e.target.value)}
              className={inputClass}
              placeholder="Lundi 14h-16h, Jeudi 15h-17h"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Biographie
            </label>
            <textarea
              id="bio"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
