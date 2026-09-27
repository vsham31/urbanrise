const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');

const OUTCOMES = new Set(['Interested', 'Needs time', 'Not interested', 'No show']);
const EXECUTIVE_PATTERN = /^EX-\d{2}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

function splitExecutive(executive) {
  const match = String(executive || '').match(/^(EX-\d{2})\s+(.+)$/);
  return match ? { id: match[1], name: match[2] } : { id: '', name: String(executive || '') };
}

function visitBrief(visit) {
  const time = String(visit.visit_at).slice(11, 16);
  const status = visit.outcome || 'Awaiting outcome';
  return `${time} visit for ${visit.config} at ${visit.project}.\nCurrent status: ${status}.`;
}

function toSafeVisit(visit) {
  const phone = String(visit.phone || '');
  return {
    visit_id: visit.visit_id,
    lead_id: visit.lead_id,
    customer_name: visit.customer_name,
    phone: `******${phone.slice(-4)}`,
    project: visit.project,
    config: visit.config,
    visit_at: visit.visit_at,
    executive: splitExecutive(visit.executive),
    outcome: visit.outcome || '',
    next_action: visit.next_action || '',
    brief: visitBrief(visit)
  };
}

function createStore({ dataFile, csvFile }) {
  function ensureSeeded() {
    if (fs.existsSync(dataFile)) return;
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    const rows = parse(fs.readFileSync(csvFile, 'utf8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    write(rows);
  }

  function read() {
    ensureSeeded();
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }

  function write(rows) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    const temporaryFile = `${dataFile}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryFile, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryFile, dataFile);
  }

  return { read, write };
}

function createApp(options = {}) {
  const app = express();
  const store = createStore({
    dataFile: options.dataFile || process.env.VISITS_DATA_FILE || path.join(__dirname, 'data', 'visits.json'),
    csvFile: options.csvFile || path.join(__dirname, 'visits.csv')
  });

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/visits', (req, res) => {
    const { executive, date } = req.query;
    if (typeof executive !== 'string' || !EXECUTIVE_PATTERN.test(executive)) {
      return res.status(400).json({ error: 'executive must be an ID such as EX-01.' });
    }
    if (!isCalendarDate(date)) {
      return res.status(400).json({ error: 'date must be a real calendar date in YYYY-MM-DD format.' });
    }

    const visits = store.read()
      .filter((visit) => splitExecutive(visit.executive).id === executive && visit.visit_at.startsWith(date))
      .sort((left, right) => left.visit_at.localeCompare(right.visit_at))
      .map(toSafeVisit);
    return res.json({ visits });
  });

  app.patch('/visits/:id/outcome', (req, res) => {
    const { outcome, next_action: nextAction } = req.body || {};
    if (typeof outcome !== 'string') {
      return res.status(400).json({ error: 'outcome must be provided as a string.' });
    }
    if (typeof nextAction !== 'string') {
      return res.status(400).json({ error: 'next_action must be a string (it may be blank).' });
    }
    if (!OUTCOMES.has(outcome)) {
      return res.status(422).json({ error: 'outcome must be Interested, Needs time, Not interested, or No show.' });
    }
    const trimmedNextAction = nextAction.trim();
    if (trimmedNextAction.length > 500) {
      return res.status(422).json({ error: 'next_action must be 500 characters or fewer.' });
    }

    const visits = store.read();
    const index = visits.findIndex((visit) => visit.visit_id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Visit not found.' });

    visits[index] = { ...visits[index], outcome, next_action: trimmedNextAction };
    store.write(visits);
    return res.json({ visit: toSafeVisit(visits[index]) });
  });

  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    return next(error);
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(3000, () => console.log('Urbanrise site visits running at http://localhost:3000'));
}

module.exports = { createApp, toSafeVisit, isCalendarDate };
