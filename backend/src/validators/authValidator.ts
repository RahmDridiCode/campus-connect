import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide').min(3, 'Email trop court').max(255, 'Email trop long'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(255, 'Le mot de passe est trop long'),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom est trop long'),
  specialty: z.string().max(255, 'La spécialité est trop longue').optional(),
  studyLevel: z
    .enum(['BACHELOR', 'MASTER', 'PHD'], {
      errorMap: () => ({ message: "Niveau d'études invalide" }),
    })
    .optional()
    .default('BACHELOR'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email invalide').min(3, 'Email trop court'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  specialty: z.string().max(255, 'La spécialité est trop longue').optional(),
  studyLevel: z.enum(['BACHELOR', 'MASTER', 'PHD']).optional(),
  bio: z.string().max(500, 'La biographie est trop longue').optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 compétences').optional(),
  availabilities: z.array(z.string()).max(10, 'Maximum 10 disponibilités').optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
