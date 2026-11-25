'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { Avatar, Button, PageHeader, RatingDisplay } from '@/components/UI';
import { errorMessage, DashboardData } from '@/types/app';
import api from '@/lib/api';
import { studyLevelLabels } from '@/lib/format';

const inputClass = 'input';
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
  const [stats, setStats] = useState<DashboardData | null>(null);

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

  // Note moyenne et nombre d'avis reçus (données réelles du tableau de bord)
  useEffect(() => {
    if (!user) return;
    api
      .get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null));
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
      <PageHeader
        title="Mon profil"
        description="Ces informations aident à vous recommander aux bonnes demandes."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="card flex flex-col items-center p-6 text-center">
            <Avatar name={user?.fullName} className="h-20 w-20 text-2xl" />
            <h2 className="mt-4 text-lg font-semibold">{user?.fullName}</h2>
            <p className="break-all text-sm text-slate-600">{user?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Étudiant'}
              </span>
              {user?.studyLevel && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {studyLevelLabels[user.studyLevel] ?? user.studyLevel}
                </span>
              )}
            </div>

            <div className="mt-5 w-full border-t border-slate-100 pt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Évaluations reçues
              </p>
              {stats && stats.totalReviews > 0 && stats.averageRating ? (
                <div className="flex justify-center">
                  <RatingDisplay rating={stats.averageRating} count={stats.totalReviews} />
                </div>
              ) : (
                <p className="text-sm text-slate-500">Pas encore d'évaluation.</p>
              )}
            </div>

            {user && user.skills.length > 0 && (
              <ul className="mt-5 flex flex-wrap justify-center gap-1.5 border-t border-slate-100 pt-5">
                {user.skills.map((s) => (
                  <li key={s} className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="card p-5 sm:p-8 lg:col-span-2" aria-labelledby="edit-profile">
          <h2 id="edit-profile" className="mb-5 text-lg font-semibold">
            Modifier mes informations
          </h2>

          {message && (
            <div role="status" className={`mb-5 ${message.ok ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="label">
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
                <label htmlFor="specialty" className="label">
                  Spécialité
                </label>
                <input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className={inputClass}
                  placeholder="Informatique"
                />
              </div>
            </div>
            <div>
              <label htmlFor="studyLevel" className="label">
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
              <label htmlFor="skills" className="label">
                Compétences
              </label>
              <input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={inputClass}
                placeholder="Java, SQL, React"
              />
              <p className="field-hint">Séparées par des virgules.</p>
            </div>
            <div>
              <label htmlFor="availabilities" className="label">
                Disponibilités
              </label>
              <input
                id="availabilities"
                value={availabilities}
                onChange={(e) => setAvailabilities(e.target.value)}
                className={inputClass}
                placeholder="Lundi 14h-16h, Jeudi 15h-17h"
              />
              <p className="field-hint">Séparées par des virgules.</p>
            </div>
            <div>
              <label htmlFor="bio" className="label">
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
              <p className="field-hint">{bio.length}/500 caractères</p>
            </div>
            <Button type="submit" loading={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
