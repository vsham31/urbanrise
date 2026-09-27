const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, test } = require('node:test');
const request = require('supertest');
const { createApp } = require('../server');

const temporaryDirectories = [];

function appForTest() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'urbanrise-visits-'));
  temporaryDirectories.push(directory);
  return createApp({
    dataFile: path.join(directory, 'visits.json'),
    csvFile: path.join(__dirname, '..', 'visits.csv')
  });
}

afterEach(() => {
  while (temporaryDirectories.length) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true, force: true });
  }
});

test('lists only the requested schedule and masks all phone digits except the final four', async () => {
  const response = await request(appForTest()).get('/visits?executive=EX-01&date=2026-10-06');

  assert.equal(response.status, 200);
  assert.equal(response.body.visits.length, 3);
  for (const visit of response.body.visits) {
    assert.equal(visit.executive.id, 'EX-01');
    assert.match(visit.visit_at, /^2026-10-06/);
    assert.match(visit.phone, /^\*{6}\d{4}$/);
    assert.doesNotMatch(JSON.stringify(visit), /9876891703|9368971071|9658901121/);
  }
});

test('valid outcome updates persist and unknown visits return 404', async () => {
  const app = appForTest();
  const update = await request(app)
    .patch('/visits/V-3006/outcome')
    .send({ outcome: 'Interested', next_action: '  Call on Monday  ' });

  assert.equal(update.status, 200);
  assert.equal(update.body.visit.outcome, 'Interested');
  assert.equal(update.body.visit.next_action, 'Call on Monday');
  assert.equal(update.body.visit.phone, '******1703');

  const persisted = await request(app).get('/visits?executive=EX-01&date=2026-10-06');
  assert.equal(persisted.body.visits.find((visit) => visit.visit_id === 'V-3006').outcome, 'Interested');

  const unknown = await request(app)
    .patch('/visits/V-9999/outcome')
    .send({ outcome: 'Interested', next_action: '' });
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.error, 'Visit not found.');
});

test('rejects invalid list input and outcome values', async () => {
  const app = appForTest();
  assert.equal((await request(app).get('/visits?executive=EX-01&date=2026-02-30')).status, 400);
  assert.equal((await request(app)
    .patch('/visits/V-3006/outcome')
    .send({ next_action: '' })).status, 400);
  assert.equal((await request(app)
    .patch('/visits/V-3006/outcome')
    .send({ outcome: 'Maybe', next_action: '' })).status, 422);
});
