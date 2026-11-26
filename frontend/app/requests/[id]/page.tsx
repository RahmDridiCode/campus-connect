'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { ProposalCard } from '@/components/ProposalCard';
import { RatingForm } from '@/components/RatingForm';
import {
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  RatingDisplay,
  StatusBadge,
  Toast,
} from '@/components/UI';
import { Icon } from '@/components/Icons';
import { formatDate, levelLabels } from '@/lib/format';
import { useRequestDetail } from '@/hooks/useRequestDetail';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useRequestActions } from '@/hooks/useRequestActions';
import { errorMessage } from '@/types/app';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { request, proposals, reviews, loading, error, setError, reload: load } =
    useRequestDetail(id, !!user);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [dialog, setDialog] = useState<null | 'delete' | 'complete'>(null);
  const [decision, setDecision] = useState<{ id: string; action: 'accept' | 'reject' } | null>(
    null,
  );
  const [proposalMsg, setProposalMsg] = useState('');
  const [proposalAvail, setProposalAvail] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE');
  const [reportDesc, setReportDesc] = useState('');

  const isAuthor = !!user && request?.author?.id === user.id;
  const acceptedProposal = proposals.find((p) => p.status === 'ACCEPTED');
  const isAcceptedHelper = !!user && acceptedProposal?.proposerId === user.id;
  const myProposal = proposals.find((p) => p.proposerId === user?.id);

  const recos = useRecommendations(id, isAuthor && request?.status === 'OPEN');
  const actions = useRequestActions(id);

  // Exécute une action API puis recharge la page
  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessageType('success');
      setMessage(success);
      await load();
    } catch (err) {
      setError(null);
      setMessageType('error');
      setMessage(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const sendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        actions.sendProposal(
          proposalMsg,
          proposalAvail
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      'Proposition envoyée',
    );
    setProposalMsg('');
    setProposalAvail('');
  };

  const sendReport = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () => actions.sendReport(reportReason, reportDesc),
      'Signalement envoyé aux administrateurs',
    );
    setShowReport(false);
    setReportDesc('');
  };

  const sendReview = async (rating: number, comment: string) => {
    const targetId = isAuthor ? acceptedProposal?.proposerId : request?.author?.id;
    try {
      await actions.sendReview(targetId, rating, comment);
    } catch (err) {
      throw new Error(errorMessage(err));
    }
    setMessageType('success');
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
      <Link href="/requests" className="link mb-4 inline-flex items-center gap-1 text-sm">
        <Icon name="arrowLeft" className="h-4 w-4" />
        Retour aux demandes
      </Link>

      {message && <Toast message={message} type={messageType} onClose={() => setMessage(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5 sm:p-6" aria-labelledby="req-title">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                <Icon name="book" className="h-3.5 w-3.5" />
                {request.subject}
              </span>
              <StatusBadge status={request.status} />
            </div>
            <h1 id="req-title" className="text-2xl font-bold sm:text-3xl">
              {request.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-slate-700">{request.description}</p>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              {isAuthor && request.status === 'OPEN' && (
                <Link href={`/requests/${id}/edit`} className="btn-secondary">
                  Modifier
                </Link>
              )}
              {isAuthor && (
                <Button variant="danger-outline" onClick={() => setDialog('delete')}>
                  Supprimer
                </Button>
              )}
              {isParticipant && request.status === 'HELP_ACCEPTED' && (
                <Button variant="success" onClick={() => setDialog('complete')}>
                  <Icon name="check" className="h-4 w-4" />
                  Terminer la séance
                </Button>
              )}
              {user && !isAuthor && (
                <Button
                  variant="ghost"
                  className="ml-auto"
                  aria-expanded={showReport}
                  onClick={() => setShowReport(!showReport)}
                >
                  <Icon name="flag" className="h-4 w-4" />
                  Signaler
                </Button>
              )}
            </div>

            {showReport && (
              <form onSubmit={sendReport} className="mt-4 space-y-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <label htmlFor="reason" className="label">
                    Motif
                  </label>
                  <select
                    id="reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input"
                  >
                    <option value="INAPPROPRIATE">Contenu inapproprié</option>
                    <option value="SPAM">Spam</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rdesc" className="label">
                    Description (facultative)
                  </label>
                  <textarea
                    id="rdesc"
                    rows={2}
                    maxLength={500}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="input"
                  />
                </div>
                <Button type="submit" variant="danger" loading={busy}>
                  Envoyer le signalement
                </Button>
              </form>
            )}
          </section>

          {!user && request.status === 'OPEN' && (
            <div className="alert-info">
              <Link href="/auth/login" className="link">
                Connectez-vous
              </Link>{' '}
              pour proposer votre aide.
            </div>
          )}

          {canPropose && (
            <section className="card p-5 sm:p-6" aria-labelledby="propose">
              <h2 id="propose" className="mb-4 text-lg font-semibold">
                Proposer mon aide
              </h2>
              <form onSubmit={sendProposal} className="space-y-4">
                <div>
                  <label htmlFor="pmsg" className="label">
                    Message
                  </label>
                  <textarea
                    id="pmsg"
                    rows={3}
                    required
                    value={proposalMsg}
                    onChange={(e) => setProposalMsg(e.target.value)}
                    className="input"
                  />
                  <p className="field-hint">10 caractères minimum.</p>
                </div>
                <div>
                  <label htmlFor="pav" className="label">
                    Mes disponibilités
                  </label>
                  <input
                    id="pav"
                    required
                    value={proposalAvail}
                    onChange={(e) => setProposalAvail(e.target.value)}
                    className="input"
                    placeholder="Lundi 14h-16h, Jeudi 15h-17h"
                  />
                  <p className="field-hint">Séparez les créneaux par des virgules.</p>
                </div>
                <Button type="submit" loading={busy}>
                  Envoyer ma proposition
                </Button>
              </form>
            </section>
          )}

          {user && proposals.length > 0 && (
            <section aria-labelledby="props">
              <h2 id="props" className="mb-3 text-lg font-semibold">
                {isAuthor ? `Propositions reçues (${proposals.length})` : 'Ma proposition'}
              </h2>
              <div className="grid gap-3">
                {proposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    canDecide={isAuthor}
                    busy={busy}
                    onAccept={(pid) => setDecision({ id: pid, action: 'accept' })}
                    onReject={(pid) => setDecision({ id: pid, action: 'reject' })}
                  />
                ))}
              </div>
            </section>
          )}

          {isAuthor && request.status === 'OPEN' && recos.length > 0 && (
            <section aria-labelledby="recos">
              <h2 id="recos" className="mb-1 flex items-center gap-2 text-lg font-semibold">
                <Icon name="sparkles" className="h-5 w-5 text-brand-600" />
                Étudiants recommandés
              </h2>
              <p className="mb-3 text-sm text-slate-600">
                Classés selon leurs compétences, leur niveau et leurs disponibilités.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {recos.map((r) => (
                  <article key={r.userId} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.fullName} />
                        <div>
                          <h3 className="font-semibold">{r.fullName}</h3>
                          <p className="text-xs text-slate-500">
                            {r.specialty} — {r.studyLevel}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-700">
                        {r.score} pts
                      </span>
                    </div>
                    {r.averageRating !== null && (
                      <div className="mt-2">
                        <RatingDisplay rating={r.averageRating} />
                      </div>
                    )}
                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                      {r.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          )}

          {request.status === 'COMPLETED' && (
            <section className="card p-5 sm:p-6" aria-labelledby="evals">
              <h2 id="evals" className="mb-4 text-lg font-semibold">
                Évaluations
              </h2>
              {reviews.length === 0 ? (
                <p className="mb-4 text-sm text-slate-600">Aucune évaluation pour le moment.</p>
              ) : (
                <ul className="mb-4 space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-800">{r.author?.fullName}</span> →{' '}
                          {r.target?.fullName}
                        </p>
                        <RatingDisplay rating={r.rating} />
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {isParticipant && !alreadyReviewed && reviewTargetName && (
                <RatingForm targetName={reviewTargetName} onSubmit={sendReview} />
              )}
              {isParticipant && alreadyReviewed && (
                <p className="text-sm text-slate-600">Vous avez déjà évalué cette séance.</p>
              )}
            </section>
          )}
        </div>

        {/* Colonne d'informations */}
        <aside className="lg:col-span-1">
          <div className="card space-y-4 p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Informations
            </h2>
            <div className="flex items-center gap-3">
              <Avatar name={request.author?.fullName} className="h-10 w-10" />
              <div>
                <p className="text-xs text-slate-500">Publiée par</p>
                <p className="font-medium text-slate-900">{request.author?.fullName}</p>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Niveau requis</dt>
                <dd className="font-medium">{levelLabels[request.requiredLevel]}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Disponibilités</dt>
                <dd>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {request.availabilities.map((a) => (
                      <li
                        key={a}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        <Icon name="calendar" className="h-3 w-3" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Publiée le</dt>
                <dd className="font-medium">{formatDate(request.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={decision !== null}
        title={
          decision?.action === 'accept'
            ? 'Accepter cette proposition ?'
            : 'Refuser cette proposition ?'
        }
        message={
          decision?.action === 'accept'
            ? 'La demande passera à « Aide acceptée » et les autres propositions en attente seront refusées.'
            : 'Le proposant sera informé du refus.'
        }
        confirmLabel={decision?.action === 'accept' ? 'Accepter' : 'Refuser'}
        tone={decision?.action === 'accept' ? 'primary' : 'danger'}
        isLoading={busy}
        onCancel={() => setDecision(null)}
        onConfirm={async () => {
          if (!decision) return;
          const { id: pid, action } = decision;
          setDecision(null);
          await run(
            () => actions.decideProposal(pid, action),
            action === 'accept' ? 'Proposition acceptée' : 'Proposition refusée',
          );
        }}
      />
      <ConfirmDialog
        isOpen={dialog === 'delete'}
        title="Supprimer la demande"
        message="Cette action est définitive. Voulez-vous continuer ?"
        confirmLabel="Supprimer"
        tone="danger"
        isLoading={busy}
        onCancel={() => setDialog(null)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await actions.remove();
            router.push('/requests');
          } catch (err) {
            setMessageType('error');
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
          await run(() => actions.complete(), 'Séance terminée');
        }}
      />
    </AppShell>
  );
}
