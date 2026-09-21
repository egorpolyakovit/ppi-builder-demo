/*
  PPI Builder Demo
  ----------------
  Public, simplified, deterministic example.
  Production matching rules, thresholds, coefficients, private datasets and
  selected methodology components are intentionally excluded.
*/

const MIN_SAMPLE = 3; // demo threshold only; not a production rule
let loadedRows = [];
let lastOutput = null;

const $ = (id) => document.getElementById(id);

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(s => s.trim());
  return lines.slice(1).filter(Boolean).map(line => {
    const cols = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]));
  });
}

function median(values) {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function normalizeRow(r) {
  const area = Number(r.area_sqm);
  const amount = Number(r.amount_aed);
  const date = new Date(r.date);
  const usage = String(r.usage || '').toLowerCase();
  const deal = String(r.deal || '').toLowerCase();
  const community = String(r.community || '').trim();

  if (!community || !Number.isFinite(area) || area <= 0 || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.getTime())) return null;
  if (!['residential','commercial'].includes(usage)) return null;
  if (!['sale','rent'].includes(deal)) return null;

  return {
    community,
    usage,
    deal,
    period: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`,
    price_per_sqm: amount / area
  };
}

function build(rows) {
  const valid = rows.map(normalizeRow).filter(Boolean);
  const groups = new Map();

  for (const r of valid) {
    const key = [r.community, r.usage, r.deal, r.period].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r.price_per_sqm);
  }

  const output = [];
  for (const [key, values] of groups.entries()) {
    if (values.length < MIN_SAMPLE) continue;
    const [community, usage, deal, period] = key.split('|');
    output.push({
      community,
      usage,
      deal,
      period,
      observations: values.length,
      median_price_per_sqm_aed: Number(median(values).toFixed(2)),
      data_source: 'observed'
    });
  }

  output.sort((a,b) => a.community.localeCompare(b.community) || a.period.localeCompare(b.period) || a.deal.localeCompare(b.deal));
  return { validCount: valid.length, series: output };
}

async function loadSample() {
  const res = await fetch('sample-data/transactions.csv');
  const text = await res.text();
  loadedRows = parseCSV(text);
  $('rows').textContent = loadedRows.length;
  $('status').textContent = 'Sample loaded';
}

$('sample').addEventListener('click', loadSample);

$('file').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  loadedRows = parseCSV(await file.text());
  $('rows').textContent = loadedRows.length;
  $('status').textContent = 'File loaded';
});

$('run').addEventListener('click', () => {
  if (!loadedRows.length) {
    $('status').textContent = 'Load data first';
    return;
  }
  const result = build(loadedRows);
  lastOutput = {
    generated_at: new Date().toISOString(),
    methodology: 'Smart Indexes PPI methodology — public demo subset',
    note: 'Production rules and proprietary methodology details are intentionally excluded.',
    indicators: result.series
  };
  $('valid').textContent = result.validCount;
  $('series').textContent = result.series.length;
  $('status').textContent = 'Completed';
  $('output').textContent = JSON.stringify(lastOutput, null, 2);
  $('download').disabled = false;
});

$('download').addEventListener('click', () => {
  if (!lastOutput) return;
  const blob = new Blob([JSON.stringify(lastOutput, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ppi-builder-demo-output.json';
  a.click();
  URL.revokeObjectURL(url);
});
