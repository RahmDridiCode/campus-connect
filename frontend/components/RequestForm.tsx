'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './UI';

// Validation côté client (le serveur revalide toujours)
const schema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(200),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(2000),
  subject: z.string().min(2, 'La matière est requise').max(100),
  requiredLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  availabilities: z.string().min(2, 'Indiquez au moins une disponibilité'),
});

type FormValues = z.infer<typeof schema>;

export interface RequestFormPayload {
  title: string;
  description: string;
  subject: string;
  requiredLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  availabilities: string[];
}

interface Props {
  initial?: Partial<RequestFormPayload>;
  submitLabel: string;
  onSubmit: (data: RequestFormPayload) => Promise<void>;
}

const inputClass = 'input';

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="label">
      {label}
    </label>
    {children}
    {error && (
      <p className="field-error" role="alert">
        {error}
      </p>
    )}
  </div>
);

export const RequestForm = ({ initial, submitLabel, onSubmit }: Props) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      subject: initial?.subject ?? '',
      requiredLevel: initial?.requiredLevel ?? 'BEGINNER',
      // les disponibilités sont saisies séparées par des virgules
      availabilities: initial?.availabilities?.join(', ') ?? '',
    },
  });

  const submit = async (values: FormValues) => {
    setServerError(null);
    try {
      await onSubmit({
        ...values,
        availabilities: values.availabilities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (err: any) {
      setServerError(err.message || 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="alert-error" role="alert">
          {serverError}
        </div>
      )}
      <Field id="title" label="Titre" error={errors.title?.message}>
        <input id="title" {...register('title')} className={inputClass} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="subject" label="Matière" error={errors.subject?.message}>
          <input
            id="subject"
            {...register('subject')}
            className={inputClass}
            placeholder="Ex : Java"
          />
        </Field>
        <Field id="requiredLevel" label="Niveau requis">
          <select id="requiredLevel" {...register('requiredLevel')} className={inputClass}>
            <option value="BEGINNER">Débutant</option>
            <option value="INTERMEDIATE">Intermédiaire</option>
            <option value="ADVANCED">Avancé</option>
          </select>
        </Field>
      </div>
      <Field id="description" label="Description" error={errors.description?.message}>
        <textarea id="description" rows={5} {...register('description')} className={inputClass} />
      </Field>
      <Field
        id="availabilities"
        label="Disponibilités (séparées par des virgules)"
        error={errors.availabilities?.message}
      >
        <input
          id="availabilities"
          {...register('availabilities')}
          className={inputClass}
          placeholder="Lundi 14h-16h, Jeudi 15h-17h"
        />
      </Field>
      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? 'Envoi...' : submitLabel}
      </Button>
    </form>
  );
};
