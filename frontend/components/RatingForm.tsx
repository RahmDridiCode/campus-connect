'use client';

import { useState } from 'react';
import { Button } from './UI';
import { Icon } from './Icons';

interface Props {
  targetName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

const ratingLabels = ['', 'Insuffisant', 'Passable', 'Bien', 'Très bien', 'Excellent'];

// Formulaire de notation : 1 à 5 étoiles (boutons radio accessibles) + commentaire facultatif
export const RatingForm = ({ targetName, onSubmit }: Props) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError('La note doit être comprise entre 1 et 5');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(rating, comment.trim());
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg bg-slate-50 p-4">
      <h3 className="font-semibold">Évaluer {targetName}</h3>
      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}
      <fieldset>
        <legend className="label">Note</legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-brand-500"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              <span className="sr-only">
                {n} sur 5 — {ratingLabels[n]}
              </span>
              <Icon
                name="star"
                filled={n <= rating}
                className={`h-8 w-8 transition-colors ${n <= rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
              />
            </label>
          ))}
          <span className="ml-2 text-sm text-slate-600" aria-live="polite">
            {rating}/5 — {ratingLabels[rating]}
          </span>
        </div>
      </fieldset>
      <div>
        <label htmlFor="comment" className="label">
          Commentaire (facultatif)
        </label>
        <textarea
          id="comment"
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
          placeholder="Partagez votre expérience de la séance"
        />
      </div>
      <Button type="submit" loading={loading}>
        {loading ? 'Envoi...' : "Envoyer l'évaluation"}
      </Button>
    </form>
  );
};
