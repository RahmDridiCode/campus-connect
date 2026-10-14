import { z } from 'zod';

export const CreateReportSchema = z.object({
  requestId: z.string().min(1, "L'ID de la demande est requis"),
  reason: z.enum(['INAPPROPRIATE', 'SPAM', 'OTHER'], {
    errorMap: () => ({
      message: 'Raison invalide',
    }),
  }),
  description: z.string().max(500, 'La description est trop longue').optional(),
});

export const UpdateReportSchema = z.object({
  // HIDE = masquer la demande et traiter (REVIEWED) ; DISMISS = rejeter (DISMISSED)
  action: z.enum(['HIDE', 'DISMISS'], {
    errorMap: () => ({
      message: 'Action invalide',
    }),
  }),
  notes: z.string().max(500, 'Les notes sont trop longues').optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>;
