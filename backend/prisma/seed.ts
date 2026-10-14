import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.helpProposal.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // Create Users
  // ============================================

  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Admin User',
      specialty: 'Computer Science',
      studyLevel: 'MASTER',
      skills: ['React', 'TypeScript', 'Node.js'],
      availabilities: ['Lundi 14h-16h', 'Jeudi 15h-17h'],
      role: 'ADMIN',
      bio: 'Administrateur de la plateforme CampusConnect',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: studentPassword,
      fullName: 'Ahmed Dridi',
      specialty: 'Computer Science',
      studyLevel: 'BACHELOR',
      skills: ['Java', 'Python', 'SQL'],
      availabilities: ['Lundi 14h-16h', 'Mardi 10h-12h'],
      role: 'STUDENT',
      bio: 'Passionné par la programmation et les technologies web.',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: studentPassword,
      fullName: 'Fatima Zahra',
      specialty: 'Mathematics',
      studyLevel: 'BACHELOR',
      skills: ['Algebra', 'Calculus', 'Geometry'],
      availabilities: ['Mardi 10h-12h', 'Vendredi 9h-11h'],
      role: 'STUDENT',
      bio: 'Spécialiste en mathématiques pures.',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      password: studentPassword,
      fullName: 'Mohamed Ben Ali',
      specialty: 'Computer Science',
      studyLevel: 'MASTER',
      skills: ['React', 'TypeScript', 'Vue.js'],
      availabilities: ['Jeudi 15h-17h'],
      role: 'STUDENT',
      bio: 'Développeur frontend expérimenté.',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      email: 'student4@example.com',
      password: studentPassword,
      fullName: 'Aisha Khan',
      specialty: 'Physics',
      studyLevel: 'MASTER',
      skills: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
      availabilities: ['Mercredi 14h-16h'],
      role: 'STUDENT',
      bio: 'Passionnée par la physique théorique.',
    },
  });

  // ============================================
  // Create Help Requests
  // ============================================

  const request1 = await prisma.helpRequest.create({
    data: {
      title: 'Aide en Java pour projet POO',
      description:
        'Besoin d\'aide pour comprendre les concepts de programmation orientée objet en Java. Je travaille sur un projet de gestion de bibliothèque.',
      subject: 'Java',
      requiredLevel: 'INTERMEDIATE',
      authorId: student1.id,
      status: 'OPEN',
      availabilities: ['Lundi 14h-16h', 'Jeudi 15h-17h'],
    },
  });

  const request2 = await prisma.helpRequest.create({
    data: {
      title: 'Révision Calcul Intégral',
      description:
        'Je dois me préparer pour l\'examen de calcul intégral. Besoin de quelques séances de révision pour bien comprendre les techniques d\'intégration.',
      subject: 'Calculus',
      requiredLevel: 'ADVANCED',
      authorId: student2.id,
      status: 'OPEN',
      availabilities: ['Mardi 10h-12h', 'Vendredi 14h-16h'],
    },
  });

  const request3 = await prisma.helpRequest.create({
    data: {
      title: 'React et Hooks - Débutant',
      description:
        'Je débute avec React et j\'ai du mal à comprendre les Hooks. Quelqu\'un pour m\'expliquer useState, useEffect et les règles des Hooks ?',
      subject: 'React',
      requiredLevel: 'BEGINNER',
      authorId: student4.id,
      status: 'HELP_ACCEPTED',
      availabilities: ['Mercredi 16h-18h', 'Samedi 10h-12h'],
    },
  });

  const request4 = await prisma.helpRequest.create({
    data: {
      title: 'Physique Quantique - Équation de Schrödinger',
      description:
        'Besoin d\'aide pour résoudre des problèmes d\'équation de Schrödinger. Les applications pratiques me posent problème.',
      subject: 'Quantum Mechanics',
      requiredLevel: 'ADVANCED',
      authorId: student1.id,
      status: 'COMPLETED',
      availabilities: ['Lundi 11h-13h'],
    },
  });

  // ============================================
  // Create Proposals
  // ============================================

  void (await prisma.helpProposal.create({
    data: {
      requestId: request1.id,
      proposerId: student3.id,
      message:
        'Salut ! J\'ai expérience en Java et POO. Je peux t\'aider sur ton projet de bibliothèque. Je suis libre les jours que tu as proposés.',
      availabilities: ['Lundi 14h-16h', 'Jeudi 15h-17h'],
      status: 'PENDING',
    },
  }));

  void (await prisma.helpProposal.create({
    data: {
      requestId: request2.id,
      proposerId: student4.id,
      message:
        'Je peux t\'aider pour le Calcul Intégral. J\'ai des bonnes notes en mathématiques et je comprends bien les techniques d\'intégration.',
      availabilities: ['Mardi 10h-12h'],
      status: 'PENDING',
    },
  }));

  void (await prisma.helpProposal.create({
    data: {
      requestId: request3.id,
      proposerId: student3.id,
      message: 'Je suis spécialiste en React ! Je t\'expliquerai tous les Hooks avec des exemples concrets.',
      availabilities: ['Mercredi 16h-18h'],
      status: 'ACCEPTED',
    },
  }));

  // ============================================
  // Create Reviews (for completed request)
  // ============================================

  void (await prisma.review.create({
    data: {
      requestId: request4.id,
      authorId: student1.id, // Auteur de la demande évalue le proposeur
      targetId: student4.id, // Le proposeur accepté
      rating: 5,
      comment: 'Excellent ! Très compétent en physique quantique. A bien expliqué les concepts.',
    },
  }));

  void (await prisma.review.create({
    data: {
      requestId: request4.id,
      authorId: student4.id, // Le proposeur évalue l'auteur
      targetId: student1.id,
      rating: 4,
      comment: 'Bonne collaboration. Questions intéressantes et attentif aux explications.',
    },
  }));

  // ============================================
  // Create Reports
  // ============================================

  void (await prisma.report.create({
    data: {
      requestId: request2.id,
      reporterId: student1.id,
      reason: 'Contenu inapproprié',
      description: 'La description contient un langage inadapté.',
      status: 'PENDING',
    },
  }));

  console.log('✅ Database seeded successfully!');
  console.log(`
  📊 Summary:
  - 4 users created
  - 4 requests created
  - 3 proposals created
  - 2 reviews created
  - 1 report created
  - Users: ${[admin, student1, student2, student3, student4].length}
  - Help Requests: 4
  - Proposals: 3
  - Reviews: 2
  - Reports: 1

  🔐 Demo Accounts:
  - Admin: admin@example.com / admin123
  - Student: student1@example.com / student123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
