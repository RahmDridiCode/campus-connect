'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {justRegistered && (
        <div role="status" className="p-3 bg-green-100 text-green-800 rounded">
          Votre compte a été créé avec succès. Connectez-vous pour continuer.
        </div>
      )}
      {serverError && <div className="p-3 bg-red-100 text-red-700 rounded">{serverError}</div>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="votre@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Mot de passe
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </button>

      <p className="text-center text-sm">
        Pas encore de compte ?{' '}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <div className="p-3 bg-red-100 text-red-700 rounded">{serverError}</div>}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nom complet
        </label>
        <input
          {...register('fullName')}
          type="text"
          id="fullName"
          placeholder="Ahmed Dridi"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="votre@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="specialty" className="block text-sm font-medium mb-1">
          Spécialité (optionnel)
        </label>
        <input
          {...register('specialty')}
          type="text"
          id="specialty"
          placeholder="Informatique"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="studyLevel" className="block text-sm font-medium mb-1">
          Niveau d'études
        </label>
        <select
          {...register('studyLevel')}
          id="studyLevel"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        >
          <option value="BACHELOR">Licence</option>
          <option value="MASTER">Master</option>
          <option value="PHD">Doctorat</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Mot de passe
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirmer le mot de passe
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          placeholder="••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Inscription...' : "S'inscrire"}
      </button>

      <p className="text-center text-sm">
        Déjà inscrit ?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
};
