import request from 'supertest';
import app from '../src/index';

// Tests d'intégration : ils utilisent la vraie base PostgreSQL (docker-compose up -d)
// et le compte admin créé par le seed (npx prisma db seed).
// Chaque exécution crée de nouveaux utilisateurs avec un e-mail unique.

const run = Date.now();
const password = 'secret123';

// L'inscription ne connecte pas : on se connecte ensuite avec le même agent (qui garde le cookie)
const register = async (name: string) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/register').send({
    email: `${name}.${run}@test.com`,
    password,
    confirmPassword: password,
    fullName: `Test ${name}`,
  });
  await agent.post('/api/v1/auth/login').send({ email: `${name}.${run}@test.com`, password });
  return { agent, res };
};

describe('CampusConnect API', () => {
  let author: ReturnType<typeof request.agent>;
  let helper: ReturnType<typeof request.agent>;
  let helperId: string;
  let requestId: string;
  let proposalId: string;

  beforeAll(async () => {
    author = (await register('author')).agent;
    const h = await register('helper');
    helper = h.agent;
    helperId = h.res.body.data.user.id;
  });

  describe('Authentification', () => {
    it('inscrit un étudiant avec le rôle STUDENT, sans mot de passe dans la réponse', async () => {
      const { res } = await register('student');
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(JSON.stringify(res.body)).not.toContain('"password"');
    });

    it("l'inscription ne crée ni cookie ni session, la connexion ensuite fonctionne", async () => {
      const email = `nologin.${run}@test.com`;
      const agent = request.agent(app);
      const reg = await agent
        .post('/api/v1/auth/register')
        .send({ email, password, confirmPassword: password, fullName: 'No Login' });
      expect(reg.status).toBe(201);
      expect(reg.headers['set-cookie']).toBeUndefined();
      expect(reg.body.data.token).toBeUndefined();
      expect((await agent.get('/api/v1/auth/me')).status).toBe(401);

      const login = await agent.post('/api/v1/auth/login').send({ email, password });
      expect(login.status).toBe(200);
      expect(login.headers['set-cookie']).toBeDefined();
      expect((await agent.get('/api/v1/auth/me')).status).toBe(200);
      expect((await agent.get('/api/v1/dashboard')).status).toBe(200);
    });

    it("ignore une tentative de s'attribuer le rôle ADMIN", async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `evil.${run}@test.com`,
          password,
          confirmPassword: password,
          fullName: 'Evil',
          role: 'ADMIN',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('STUDENT');
    });

    it('refuse un e-mail déjà utilisé (409)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `author.${run}@test.com`,
          password,
          confirmPassword: password,
          fullName: 'Doublon',
        });
      expect(res.status).toBe(409);
    });

    it('refuse un mauvais mot de passe (401)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: `author.${run}@test.com`, password: 'mauvais' });
      expect(res.status).toBe(401);
    });

    it('protège /auth/me (401 sans cookie, 200 avec)', async () => {
      expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
      expect((await author.get('/api/v1/auth/me')).status).toBe(200);
    });
  });

  describe('Demandes, propositions et séance', () => {
    it('valide les données côté serveur (400)', async () => {
      const res = await author.post('/api/v1/requests').send({ title: 'x' });
      expect(res.status).toBe(400);
    });

    it('crée une demande OPEN', async () => {
      const res = await author.post('/api/v1/requests').send({
        title: 'Aide en Java',
        description: 'Je ne comprends pas les interfaces en Java.',
        subject: 'Java',
        requiredLevel: 'BEGINNER',
        availabilities: ['Lundi 14h'],
      });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('OPEN');
      requestId = res.body.data.id;
    });

    it('interdit de proposer son aide à sa propre demande (403)', async () => {
      const res = await author
        .post(`/api/v1/requests/${requestId}/proposals`)
        .send({ message: 'Je me propose moi-même', availabilities: ['Lundi 14h'] });
      expect(res.status).toBe(403);
    });

    it('accepte une proposition puis refuse le doublon (409)', async () => {
      const body = { message: 'Je peux vous aider en Java', availabilities: ['Lundi 14h'] };
      const res = await helper.post(`/api/v1/requests/${requestId}/proposals`).send(body);
      expect(res.status).toBe(201);
      proposalId = res.body.data.id;

      const dup = await helper.post(`/api/v1/requests/${requestId}/proposals`).send(body);
      expect(dup.status).toBe(409);
    });

    it("interdit d'évaluer avant la fin de la séance (409)", async () => {
      const res = await author
        .post(`/api/v1/requests/${requestId}/reviews`)
        .send({ targetId: helperId, rating: 5 });
      expect(res.status).toBe(409);
    });

    it("interdit à un non-auteur d'accepter (403)", async () => {
      const res = await helper.patch(`/api/v1/proposals/${proposalId}/accept`);
      expect(res.status).toBe(403);
    });

    it("l'auteur accepte : la demande passe à HELP_ACCEPTED", async () => {
      const res = await author.patch(`/api/v1/proposals/${proposalId}/accept`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACCEPTED');

      const detail = await author.get(`/api/v1/requests/${requestId}`);
      expect(detail.body.data.status).toBe('HELP_ACCEPTED');
    });

    it('interdit de modifier une demande non ouverte (403)', async () => {
      const res = await author
        .patch(`/api/v1/requests/${requestId}`)
        .send({ title: 'Nouveau titre' });
      expect(res.status).toBe(403);
    });

    it("l'aidant accepté peut terminer la séance", async () => {
      const res = await helper.post(`/api/v1/requests/${requestId}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('autorise une évaluation, refuse la note 6 et le doublon', async () => {
      const bad = await author
        .post(`/api/v1/requests/${requestId}/reviews`)
        .send({ targetId: helperId, rating: 6 });
      expect(bad.status).toBe(400);

      const ok = await author
        .post(`/api/v1/requests/${requestId}/reviews`)
        .send({ targetId: helperId, rating: 5, comment: 'Très clair' });
      expect(ok.status).toBe(201);

      const dup = await author
        .post(`/api/v1/requests/${requestId}/reviews`)
        .send({ targetId: helperId, rating: 4 });
      expect(dup.status).toBe(409);
    });

    it('les statistiques du tableau de bord reflètent les données', async () => {
      const res = await author.get('/api/v1/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalRequests).toBe(1);
      expect(res.body.data.completedRequests).toBe(1);
      expect(res.body.data.receivedProposals).toBe(1);
    });
  });

  describe('Administration', () => {
    it("refuse l'accès aux signalements à un étudiant (403) et sans connexion (401)", async () => {
      expect((await author.get('/api/v1/admin/reports')).status).toBe(403);
      expect((await request(app).get('/api/v1/admin/reports')).status).toBe(401);
    });

    it("autorise l'administrateur du seed", async () => {
      const admin = request.agent(app);
      const login = await admin
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });
      expect(login.status).toBe(200);
      expect((await admin.get('/api/v1/admin/reports')).status).toBe(200);
    });
  });

  describe('Traitement des signalements', () => {
    let admin: ReturnType<typeof request.agent>;
    let reporter: ReturnType<typeof request.agent>;
    let reqA: string;
    let reqB: string;
    let reportA: string;
    let reportB: string;

    const newRequest = async (title: string) => {
      const res = await author.post('/api/v1/requests').send({
        title,
        description: 'Description suffisamment longue pour la validation.',
        subject: 'Chimie',
        requiredLevel: 'BEGINNER',
        availabilities: ['Mardi 10h'],
      });
      return res.body.data.id as string;
    };
    const report = async (requestId: string) => {
      const res = await reporter
        .post('/api/v1/reports')
        .send({ requestId, reason: 'SPAM', description: 'test' });
      expect(res.status).toBe(201);
      return res.body.data.id as string;
    };

    beforeAll(async () => {
      reporter = (await register('reporter')).agent;
      admin = request.agent(app);
      await admin
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });
      reqA = await newRequest('Demande à masquer');
      reqB = await newRequest('Demande à garder');
      reportA = await report(reqA);
      reportB = await report(reqB);
    });

    it('refuse le traitement à un étudiant (403) et sans connexion (401)', async () => {
      const body = { action: 'HIDE' };
      expect((await reporter.patch(`/api/v1/admin/reports/${reportA}`).send(body)).status).toBe(
        403,
      );
      expect((await request(app).patch(`/api/v1/admin/reports/${reportA}`).send(body)).status).toBe(
        401,
      );
    });

    it('refuse une action invalide (400), dont les anciens champs', async () => {
      const res = await admin
        .patch(`/api/v1/admin/reports/${reportA}`)
        .send({ status: 'REVIEWED' });
      expect(res.status).toBe(400);
    });

    it('rejeter : DISMISSED, reviewedBy/At renseignés, la demande reste visible', async () => {
      const res = await admin.patch(`/api/v1/admin/reports/${reportB}`).send({ action: 'DISMISS' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DISMISSED');
      expect(res.body.data.reviewedBy).toBeTruthy();
      expect(res.body.data.reviewedAt).toBeTruthy();
      expect((await reporter.get(`/api/v1/requests/${reqB}`)).status).toBe(200);
    });

    it('masquer et traiter : REVIEWED, demande introuvable pour les étudiants', async () => {
      const res = await admin.patch(`/api/v1/admin/reports/${reportA}`).send({ action: 'HIDE' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REVIEWED');
      expect(res.body.data.reviewedBy).toBeTruthy();
      expect(res.body.data.reviewedAt).toBeTruthy();

      expect((await reporter.get(`/api/v1/requests/${reqA}`)).status).toBe(404);
      expect((await author.get(`/api/v1/requests/${reqA}`)).status).toBe(404);
      const list = await reporter.get('/api/v1/requests').query({ search: 'Demande à masquer' });
      expect(JSON.stringify(list.body)).not.toContain(reqA);
      // la donnée est conservée : l'administrateur peut toujours la consulter
      expect((await admin.get(`/api/v1/requests/${reqA}`)).status).toBe(200);
    });

    it('un signalement déjà traité ne peut plus être retraité (409)', async () => {
      const res = await admin.patch(`/api/v1/admin/reports/${reportA}`).send({ action: 'DISMISS' });
      expect(res.status).toBe(409);
    });

    it('rejeter un second signalement ne rend pas visible une demande déjà masquée', async () => {
      const reqC = await newRequest('Demande doublement signalée');
      const first = await report(reqC);
      const second = await report(reqC);
      await admin.patch(`/api/v1/admin/reports/${first}`).send({ action: 'HIDE' });

      const res = await admin.patch(`/api/v1/admin/reports/${second}`).send({ action: 'DISMISS' });
      expect(res.body.data.status).toBe('DISMISSED');
      expect((await reporter.get(`/api/v1/requests/${reqC}`)).status).toBe(404);
    });
  });
});
