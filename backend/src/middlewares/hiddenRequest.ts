import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Appliqué à toutes les routes /requests/:id/... :
 * une demande masquée par un administrateur répond 404 à tout le monde sauf aux ADMIN,
 * même si l'on connaît son ID (détail, propositions, évaluations, recommandations...).
 */
export const hiddenRequestGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await prisma.helpRequest.findUnique({
      where: { id: req.params.id },
      select: { hidden: true },
    });
    if (request?.hidden && req.user?.role !== 'ADMIN') {
      res.status(404).json({ success: false, message: 'Demande non trouvée' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
};
