'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './UI';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const justRegistered = useSearchParams().get('registered') === '1';
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      setServerError(error.message || 'Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {justRegistered && (
        <div role="status" className="alert-success">
          Votre compte a été créé avec succès. Connectez-vous pour continuer.
        </div>
      )}
      {serverError && (
        <div className="alert-error" role="alert">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="votre@email.com"
          className="input"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••"
          className="input"
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="field-error" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <Link href="/auth/register" className="link">
          S'inscrire
        </Link>
      </p>
    </form>
  );
};

// ============================================

const registerSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Minimum 2 caractères'),
    specialty: z.string().optional(),
    studyLevel: z.enum(['BACHELOR', 'MASTER', 'PHD']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      await registerUser(data);
      router.push('/auth/login?registered=1');
    } catch (error: any) {
      setServerError(error.message || "Erreur d'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="alert-error" role="alert">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="label">
          Nom complet
        </label>
        <input
          {...register('fullName')}
          type="text"
          id="fullName"
          placeholder="Ahmed Dridi"
          className="input"
          disabled={isSubmitting}
        />
        {errors.fullName && (
          <p className="field-error" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="votre@email.com"
          className="input"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="specialty" className="label">
          Spécialité (optionnel)
        </label>
        <input
          {...register('specialty')}
          type="text"
          id="specialty"
          placeholder="Informatique"
          className="input"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="studyLevel" className="label">
          Niveau d'études
        </label>
        <select
          {...register('studyLevel')}
          id="studyLevel"
          className="input"
          disabled={isSubmitting}
        >
          <option value="BACHELOR">Licence</option>
          <option value="MASTER">Master</option>
          <option value="PHD">Doctorat</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••"
          className="input"
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="field-error" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirmer le mot de passe
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          placeholder="••••••"
          className="input"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="field-error" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Inscription...' : "S'inscrire"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Déjà inscrit ?{' '}
        <Link href="/auth/login" className="link">
          Se connecter
        </Link>
      </p>
    </form>
  );
};
