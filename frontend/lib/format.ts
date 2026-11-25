const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const formatDate = (iso?: string | null) => (iso ? dateFormatter.format(new Date(iso)) : '');

export const initials = (name?: string | null) =>
  (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export const levelLabels: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

export const studyLevelLabels: Record<string, string> = {
  BACHELOR: 'Licence',
  MASTER: 'Master',
  PHD: 'Doctorat',
};
