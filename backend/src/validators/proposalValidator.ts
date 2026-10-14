import { z } from 'zod';

export const CreateProposalSchema = z.object({
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message est trop long'),
  availabilities: z
    .array(z.string())
    .min(1, 'Sélectionnez au moins une disponibilité')
    .max(10, 'Maximum 10 disponibilités'),
});

export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;
