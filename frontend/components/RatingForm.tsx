'use client';

import { useState } from 'react';

interface Props {
  targetName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

// Formulaire de notation : 1 à 5 étoiles + commentaire facultatif
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
    <form onSubmit={submit} className="space-y-3">
      <h3 className="font-semibold">Évaluer {targetName}</h3>
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium mb-1">
          Note
        </label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Commentaire (facultatif)
        </label>
        <textarea
          id="comment"
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Envoi...' : "Envoyer l'évaluation"}
      </button>
    </form>
  );
};
