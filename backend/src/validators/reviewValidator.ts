import { z } from 'zod';

export const CreateReviewSchema = z.object({
  targetId: z.string().min(1, "L'ID de la personne à évaluer est requis"),
  rating: z
    .number()
    .int()
    .min(1, 'La note doit être au minimum 1')
    .max(5, 'La note doit être au maximum 5'),
  comment: z.string().max(500, 'Le commentaire est trop long').optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
