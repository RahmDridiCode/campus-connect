import React from 'react';

// Loading State
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => (
  <div className="flex justify-center items-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Error State
export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <p className="text-red-800">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Réessayer
      </button>
    )}
  </div>
);

// Empty State
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    {icon && <div className="mb-4 flex justify-center text-4xl">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {action.label}
      </button>
    )}
  </div>
);

// Status Badge
export const StatusBadge: React.FC<{
  status: string;
}> = ({ status }) => {
  const styles: { [key: string]: string } = {
    OPEN: 'bg-green-100 text-green-800',
    HELP_ACCEPTED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    REVIEWED: 'bg-blue-100 text-blue-800',
    DISMISSED: 'bg-gray-100 text-gray-800',
  };

  const labels: { [key: string]: string } = {
    OPEN: 'Ouvert',
    HELP_ACCEPTED: 'Aide acceptée',
    COMPLETED: 'Terminé',
    PENDING: 'En attente',
    ACCEPTED: 'Accepté',
    REJECTED: 'Refusé',
    REVIEWED: 'Examiné',
    DISMISSED: 'Rejeté',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

// Confirm Dialog
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Traitement...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Rating Display
export const RatingDisplay: React.FC<{
  rating: number;
  count?: number;
}> = ({ rating, count }) => (
  <div className="flex items-center gap-2">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
    <span className="text-sm text-gray-600">
      {rating.toFixed(1)} {count && `(${count} avis)`}
    </span>
  </div>
);

// Notification Toast
export const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  const styles: { [key: string]: string } = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`border-l-4 p-4 rounded mb-4 ${styles[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="text-xl font-bold">
          ×
        </button>
      </div>
    </div>
  );
};
