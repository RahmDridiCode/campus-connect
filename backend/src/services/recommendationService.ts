import { PrismaClient } from '@prisma/client';
import { AuthorizationError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

// Pondération du score de compatibilité (total = 100 points)
const WEIGHTS = {
  subject: 40, // matière demandée vs compétences / spécialité
  level: 20, // niveau d'études suffisant
  availability: 20, // créneaux en commun
  rating: 20, // moyenne des évaluations reçues
};

// Niveau d'études (étudiant) et niveau requis (demande) sur la même échelle 1..3
const STUDY_LEVEL_RANK: Record<string, number> = { BACHELOR: 1, MASTER: 2, PHD: 3 };
const REQUIRED_LEVEL_RANK: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
};

// Aucune donnée privée (e-mail, etc.) n'est renvoyée
export interface StudentScore {
  userId: string;
  fullName: string;
  specialty: string;
  studyLevel: string;
  skills: string[];
  score: number;
  reasons: string[];
  averageRating: number | null;
}

const normalize = (s: string) => s.toLowerCase().trim();

const slotsOverlap = (a: string[], b: string[]): number => {
  const slotsB = b.map(normalize);
  return a
    .map(normalize)
    .filter((x) => x && slotsB.some((y) => y === x || y.includes(x) || x.includes(y))).length;
};

export const recommendationService = {
  /**
   * Recommandations pour une demande : réservé à l'auteur (ou à un admin)
   */
  async getRecommendations(
    requestId: string,
    viewer: { userId: string; role: string },
  ): Promise<StudentScore[]> {
    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundError('Demande non trouvée');
    }
    if (request.authorId !== viewer.userId && viewer.role !== 'ADMIN') {
      throw new AuthorizationError("Seul l'auteur de la demande peut voir les recommandations");
    }

    // Candidats : étudiants autres que l'auteur, n'ayant pas déjà proposé leur aide
    const proposals = await prisma.helpProposal.findMany({
      where: { requestId },
      select: { proposerId: true },
    });
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        id: { notIn: [request.authorId, ...proposals.map((p) => p.proposerId)] },
      },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        studyLevel: true,
        skills: true,
        availabilities: true,
      },
    });

    // Moyennes de notes en une seule requête
    const ratings = await prisma.review.groupBy({
      by: ['targetId'],
      where: { targetId: { in: students.map((s) => s.id) } },
      _avg: { rating: true },
    });
    const ratingByUser = new Map(ratings.map((r) => [r.targetId, r._avg.rating]));

    const subject = normalize(request.subject);
    const results: StudentScore[] = [];

    for (const student of students) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Matière (40 pts) : compétence exacte > spécialité
      const matchingSkills = student.skills.filter((sk) => {
        const skill = normalize(sk);
        return skill && (subject.includes(skill) || skill.includes(subject));
      });
      const specialtyMatch =
        !!student.specialty &&
        (subject.includes(normalize(student.specialty)) ||
          normalize(student.specialty).includes(subject));

      if (matchingSkills.length > 0) {
        score += WEIGHTS.subject;
        reasons.push(`Maîtrise ${matchingSkills.join(', ')} (+${WEIGHTS.subject})`);
      } else if (specialtyMatch) {
        const pts = Math.round(WEIGHTS.subject * 0.75);
        score += pts;
        reasons.push(`Spécialité proche de la matière (+${pts})`);
      }

      // 2. Niveau d'études (20 pts)
      if (
        (STUDY_LEVEL_RANK[student.studyLevel] || 0) >=
        (REQUIRED_LEVEL_RANK[request.requiredLevel] || 0)
      ) {
        score += WEIGHTS.level;
        reasons.push(`Niveau d'études suffisant : ${student.studyLevel} (+${WEIGHTS.level})`);
      }

      // 3. Disponibilités en commun (20 pts, proportionnel)
      const common = slotsOverlap(request.availabilities, student.availabilities);
      if (common > 0) {
        const pts = Math.round(
          WEIGHTS.availability * Math.min(1, common / request.availabilities.length),
        );
        score += pts;
        reasons.push(`${common} créneau(x) en commun (+${pts})`);
      }

      // 4. Évaluations reçues (20 pts)
      const averageRating = ratingByUser.get(student.id) ?? null;
      if (averageRating) {
        const pts = Math.round((averageRating / 5) * WEIGHTS.rating);
        score += pts;
        reasons.push(`Bien évalué : ${averageRating.toFixed(1)}/5 (+${pts})`);
      }

      // Sans correspondance de matière, l'étudiant n'est pas pertinent
      if (matchingSkills.length === 0 && !specialtyMatch) continue;

      results.push({
        userId: student.id,
        fullName: student.fullName,
        specialty: student.specialty ?? '',
        studyLevel: student.studyLevel,
        skills: student.skills,
        score,
        reasons,
        averageRating,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  },
};
