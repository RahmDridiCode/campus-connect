import { z } from 'zod';

export const CreateHelpRequestSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Le titre est trop long'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description est trop longue'),
  subject: z
    .string()
    .min(2, 'Le sujet doit contenir au moins 2 caractères')
    .max(100, 'Le sujet est trop long'),
  requiredLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  availabilities: z
    .array(z.string())
    .min(1, 'Sélectionnez au moins une disponibilité')
    .max(10, 'Maximum 10 disponibilités'),
});

export const UpdateHelpRequestSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  subject: z.string().min(2).max(100).optional(),
  requiredLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  availabilities: z.array(z.string()).min(1).max(10).optional(),
});

export const HelpRequestFilterSchema = z.object({
  subject: z.string().optional(),
  requiredLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['OPEN', 'HELP_ACCEPTED', 'COMPLETED']).optional(),
  search: z.string().optional(),
  mine: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateHelpRequestInput = z.infer<typeof CreateHelpRequestSchema>;
export type UpdateHelpRequestInput = z.infer<typeof UpdateHelpRequestSchema>;
export type HelpRequestFilterInput = z.infer<typeof HelpRequestFilterSchema>;
