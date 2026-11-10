import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createServer } from '../src/server.js';

describe('MiawBot Webhook Server Endpoints', () => {
  const app = createServer({
    githubSecret: '', // dev mode
    discordWebhookUrl: '',
    telegramBotToken: '',
    telegramChatId: ''
  });

  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  it('GET /api/status should return config state', async () => {
    const res = await request(app).get('/api/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.discordConfigured, false);
  });

  it('POST /webhook/github without X-GitHub-Event header should return 400', async () => {
    const res = await request(app)
      .post('/webhook/github')
      .send({ some: 'data' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /Missing X-GitHub-Event/);
  });

  it('POST /webhook/github with valid push payload should return 200', async () => {
    const res = await request(app)
      .post('/webhook/github')
      .set('X-GitHub-Event', 'push')
      .send({
        ref: 'refs/heads/main',
        repository: { name: 'miaw', full_name: 'rillardian655/miaw' },
        commits: [{ id: '11223344', message: 'test commit' }],
        sender: { login: 'tester' }
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('POST /api/simulate should simulate push event', async () => {
    const res = await request(app)
      .post('/api/simulate')
      .send({ type: 'push' });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
  });
});
