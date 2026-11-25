'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon, IconName } from './Icons';
import { initials } from '@/lib/format';

// ---------- Indicateurs de chargement ----------
export const Spinner: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <span
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    aria-hidden="true"
  />
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />
);

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
    <Spinner className="h-6 w-6 text-brand-600" />
    <p>{message}</p>
  </div>
);

// Squelette de liste de cartes pendant le chargement
export const CardListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Chargement">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

// ---------- Bouton avec état de chargement ----------
type Variant = 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'success' | 'ghost';

// Classes littérales : Tailwind ne détecte pas les noms construits dynamiquement
const variantClasses: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  'danger-outline': 'btn-danger-outline',
  success: 'btn-success',
  ghost: 'btn-ghost',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
> = ({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  ...rest
}) => (
  <button
    type="button"
    {...rest}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`${variantClasses[variant]} ${size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''} ${className}`}
  >
    {loading && <Spinner />}
    {children}
  </button>
);

// ---------- Messages ----------
export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="alert-error flex items-start gap-3" role="alert">
    <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
    <div className="flex-1">
      <p>{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" className="mt-3" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  iconName?: IconName;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void; href?: string };
}> = ({ icon, iconName = 'inbox', title, description, action }) => (
  <div className="flex flex-col items-center px-4 py-12 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      {icon ?? <Icon name={iconName} className="h-7 w-7" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>
    {action &&
      (action.href ? (
        <Link href={action.href} className="btn-primary mt-5">
          {action.label}
        </Link>
      ) : (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
  </div>
);

// Page d'accès refusé / erreur pleine page
export const AccessDenied: React.FC<{ message?: string }> = ({
  message = 'Cette page est réservée aux administrateurs.',
}) => (
  <div className="card mx-auto max-w-md p-8 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <Icon name="lock" className="h-7 w-7" />
    </div>
    <h1 className="text-xl font-bold">Accès refusé</h1>
    <p className="mt-2 text-sm text-slate-600">{message}</p>
    <Link href="/dashboard" className="btn-primary mt-6">
      Retour au tableau de bord
    </Link>
  </div>
);

// ---------- En-tête de page ----------
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="page-title">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

// ---------- Badge de statut (demandes, propositions, signalements) ----------
const badgeStyles: Record<string, { cls: string; label: string }> = {
  OPEN: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', label: 'Ouverte' },
  HELP_ACCEPTED: { cls: 'bg-brand-50 text-brand-700 ring-brand-600/20', label: 'Aide acceptée' },
  COMPLETED: { cls: 'bg-slate-100 text-slate-700 ring-slate-500/20', label: 'Terminée' },
  PENDING: { cls: 'bg-amber-50 text-amber-800 ring-amber-600/20', label: 'En attente' },
  ACCEPTED: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', label: 'Acceptée' },
  REJECTED: { cls: 'bg-rose-50 text-rose-700 ring-rose-600/20', label: 'Refusée' },
  REVIEWED: { cls: 'bg-brand-50 text-brand-700 ring-brand-600/20', label: 'Traité' },
  DISMISSED: { cls: 'bg-slate-100 text-slate-700 ring-slate-500/20', label: 'Rejeté' },
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = badgeStyles[status] ?? {
    cls: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {s.label}
    </span>
  );
};

// ---------- Avatar (initiales) ----------
export const Avatar: React.FC<{ name?: string | null; className?: string }> = ({
  name,
  className = 'h-9 w-9 text-sm',
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${className}`}
    aria-hidden="true"
  >
    {initials(name)}
  </span>
);

// ---------- Modale de confirmation ----------
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isLoading = false,
  tone = 'primary',
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Échap ferme la fenêtre ; le focus démarre sur « Annuler » (choix le plus sûr)
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isLoading && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-pop"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {isLoading ? 'Traitement...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------- Étoiles de notation (lecture seule) ----------
export const RatingDisplay: React.FC<{
  rating: number;
  count?: number;
}> = ({ rating, count }) => (
  <div
    className="flex items-center gap-2"
    role="img"
    aria-label={`Note : ${rating.toFixed(1)} sur 5`}
  >
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          filled={i <= Math.round(rating)}
          className={`h-4 w-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
    <span className="text-sm text-slate-600">
      {rating.toFixed(1)}
      {count ? ` (${count} avis)` : ''}
    </span>
  </div>
);

// ---------- Notification (toast) ----------
export const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  const styles: Record<string, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm"
      role={type === 'error' ? 'alert' : 'status'}
    >
      <div
        className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-pop ${styles[type]}`}
      >
        <p>{message}</p>
        <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
