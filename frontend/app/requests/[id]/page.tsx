'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { ProposalCard } from '@/components/ProposalCard';
import { RatingForm } from '@/components/RatingForm';
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  StatusBadge,
  RatingDisplay,
} from '@/components/UI';
import { HelpRequest } from '@/types/requests';
import { Proposal, Recommendation, Review, errorMessage } from '@/types/app';

const levelLabels: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [dialog, setDialog] = useState<null | 'delete' | 'complete'>(null);
  const [proposalMsg, setProposalMsg] = useState('');
  const [proposalAvail, setProposalAvail] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE');
  const [reportDesc, setReportDesc] = useState('');

  const isAuthor = !!user && request?.author?.id === user.id;
  const acceptedProposal = proposals.find((p) => p.status === 'ACCEPTED');
  const isAcceptedHelper = !!user && acceptedProposal?.proposerId === user.id;
  const myProposal = proposals.find((p) => p.proposerId === user?.id);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Demande introuvable'));
      setLoading(false);
      return;
    }
    if (user) {
      const [p, r] = await Promise.allSettled([
        api.get(`/requests/${id}/proposals`),
        api.get(`/requests/${id}/reviews`),
      ]);
      if (p.status === 'fulfilled') setProposals(p.value.data.data);
      if (r.status === 'fulfilled') setReviews(r.value.data.data);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  // Les recommandations ne sont affichées qu'à l'auteur d'une demande ouverte
  useEffect(() => {
    if (isAuthor && request?.status === 'OPEN') {
      api
        .get(`/requests/${id}/recommendations`)
        .then((res) => setRecos(res.data.data))
        .catch(() => setRecos([]));
    }
  }, [isAuthor, request?.status, id]);

  // Exécute une action API puis recharge la page
  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      await load();
    } catch (err) {
      setError(null);
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        api.post(`/requests/${id}/proposals`, {
          message: proposalMsg,
          availabilities: proposalAvail
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      'Proposition envoyée',
    );
    setProposalMsg('');
    setProposalAvail('');
  };

  const sendReport = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        api.post('/reports', {
          requestId: id,
          reason: reportReason,
          description: reportDesc || undefined,
        }),
      'Signalement envoyé aux administrateurs',
    );
    setShowReport(false);
    setReportDesc('');
  };

  const sendReview = async (rating: number, comment: string) => {
    const targetId = isAuthor ? acceptedProposal?.proposerId : request?.author?.id;
    try {
      await api.post(`/requests/${id}/reviews`, {
        targetId,
        rating,
        comment: comment || undefined,
      });
    } catch (err) {
      throw new Error(errorMessage(err));
    }
    setMessage('Évaluation enregistrée');
    await load();
  };

  if (loading)
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  if (error || !request) {
    return (
      <AppShell>
        <ErrorState message={error || 'Demande introuvable'} />
      </AppShell>
    );
  }

  const isParticipant = isAuthor || isAcceptedHelper;
  const reviewTargetName = isAuthor
    ? acceptedProposal?.proposer?.fullName
    : request.author?.fullName;
  const alreadyReviewed = reviews.some((r) => r.authorId === user?.id);
  const canPropose = !!user && !isAuthor && request.status === 'OPEN' && !myProposal;

  return (
    <AppShell>
      <Link href="/requests" className="text-sm">
        ← Retour aux demandes
      </Link>

      {message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded" role="status">
          {message}
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <StatusBadge status={request.status} />
        </div>
        <p className="text-gray-700 whitespace-pre-line mb-4">{request.description}</p>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <dt className="inline font-semibold">Matière : </dt>
            <dd className="inline">{request.subject}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Niveau : </dt>
            <dd className="inline">{levelLabels[request.requiredLevel]}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Auteur : </dt>
            <dd className="inline">{request.author?.fullName}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Disponibilités : </dt>
            <dd className="inline">{request.availabilities.join(', ')}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 mt-5">
          {isAuthor && request.status === 'OPEN' && (
            <Link
              href={`/requests/${id}/edit`}
              className="border px-4 py-2 rounded hover:bg-gray-50"
            >
              Modifier
            </Link>
          )}
          {isAuthor && (
            <button
              type="button"
              onClick={() => setDialog('delete')}
              className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-50"
            >
              Supprimer
            </button>
          )}
          {isParticipant && request.status === 'HELP_ACCEPTED' && (
            <button
              type="button"
              onClick={() => setDialog('complete')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Terminer la séance
            </button>
          )}
          {user && !isAuthor && (
            <button
              type="button"
              onClick={() => setShowReport(!showReport)}
              className="border px-4 py-2 rounded hover:bg-gray-50"
            >
              Signaler
            </button>
          )}
        </div>

        {showReport && (
          <form onSubmit={sendReport} className="mt-4 space-y-3 border-t pt-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1">
                Motif
              </label>
              <select
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="INAPPROPRIATE">Contenu inapproprié</option>
                <option value="SPAM">Spam</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="rdesc" className="block text-sm font-medium mb-1">
                Description (facultative)
              </label>
              <textarea
                id="rdesc"
                rows={2}
                maxLength={500}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Envoyer le signalement
            </button>
          </form>
        )}
      </section>

      {!user && request.status === 'OPEN' && (
        <p className="mt-6">
          <Link href="/auth/login">Connectez-vous</Link> pour proposer votre aide.
        </p>
      )}

      {canPropose && (
        <section className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-3">Proposer mon aide</h2>
          <form onSubmit={sendProposal} className="space-y-3">
            <div>
              <label htmlFor="pmsg" className="block text-sm font-medium mb-1">
                Message (10 caractères minimum)
              </label>
              <textarea
                id="pmsg"
                rows={3}
                required
                value={proposalMsg}
                onChange={(e) => setProposalMsg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="pav" className="block text-sm font-medium mb-1">
                Mes disponibilités (séparées par des virgules)
              </label>
              <input
                id="pav"
                required
                value={proposalAvail}
                onChange={(e) => setProposalAvail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Envoyer ma proposition
            </button>
          </form>
        </section>
      )}

      {user && proposals.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">
            {isAuthor ? 'Propositions reçues' : 'Ma proposition'}
          </h2>
          <div className="grid gap-3">
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                canDecide={isAuthor}
                busy={busy}
                onAccept={(pid) =>
                  run(() => api.patch(`/proposals/${pid}/accept`), 'Proposition acceptée')
                }
                onReject={(pid) =>
                  run(() => api.patch(`/proposals/${pid}/reject`), 'Proposition refusée')
                }
              />
            ))}
          </div>
        </section>
      )}

      {isAuthor && request.status === 'OPEN' && recos.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">Étudiants recommandés</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {recos.map((r) => (
              <article key={r.userId} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{r.fullName}</h3>
                  <span className="font-bold text-blue-700">{r.score} pts</span>
                </div>
                <p className="text-sm text-gray-600">
                  {r.specialty} — {r.studyLevel}
                </p>
                {r.averageRating !== null && <RatingDisplay rating={r.averageRating} />}
                <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                  {r.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {request.status === 'COMPLETED' && (
        <section className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold mb-3">Évaluations</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600 mb-4">Aucune évaluation pour le moment.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {reviews.map((r) => (
                <li key={r.id} className="border rounded p-3">
                  <p className="text-sm text-gray-600">
                    {r.author?.fullName} → {r.target?.fullName}
                  </p>
                  <RatingDisplay rating={r.rating} />
                  {r.comment && <p className="mt-1">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
          {isParticipant && !alreadyReviewed && reviewTargetName && (
            <RatingForm targetName={reviewTargetName} onSubmit={sendReview} />
          )}
          {isParticipant && alreadyReviewed && (
            <p className="text-sm text-gray-600">Vous avez déjà évalué cette séance.</p>
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={dialog === 'delete'}
        title="Supprimer la demande"
        message="Cette action est définitive. Voulez-vous continuer ?"
        confirmLabel="Supprimer"
        isLoading={busy}
        onCancel={() => setDialog(null)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await api.delete(`/requests/${id}`);
            router.push('/requests');
          } catch (err) {
            setMessage(errorMessage(err));
            setDialog(null);
            setBusy(false);
          }
        }}
      />
      <ConfirmDialog
        isOpen={dialog === 'complete'}
        title="Terminer la séance"
        message="La demande passera au statut « Terminée » et les évaluations seront ouvertes."
        confirmLabel="Terminer"
        isLoading={busy}
        onCancel={() => setDialog(null)}
        onConfirm={async () => {
          setDialog(null);
          await run(() => api.post(`/requests/${id}/complete`), 'Séance terminée');
        }}
      />
    </AppShell>
  );
}
