const assert = require('node:assert/strict');
const { test, before } = require('node:test');
const path = require('node:path');
let resolveLanguage, formatMessage, decodeMessages, errorMessage, studioCall, copy;
before(async () => {
  // Use Vite's installed bundler; no additional test runtime dependency.
  const { rolldown } = await import('rolldown');
  const entry = path.resolve(__dirname, '../src/test-messages-entry.ts');
  const bundle = await rolldown({ input: entry, plugins: [{ name: 'test-entry',
    resolveId(id) { if (id === entry) return id; },
    load(id) { if (id === entry) return 'export * from "./messages"; export { copy } from "./copy";'; },
  }] });
  try {
    const { output } = await bundle.generate({ format: 'cjs' });
    const module = { exports: {} };
    new Function('module', 'exports', output[0].code)(module, module.exports);
    ({ resolveLanguage, formatMessage, decodeMessages, errorMessage, studioCall, copy } = module.exports);
  } finally { await bundle.close(); }
});

test('locale selection honors HA preference, explicit script and fallback', () => {
  for (const language of ['zh', 'zh-Hant', 'zh-TW', 'zh_HK', 'zh-Hant-CN']) assert.equal(resolveLanguage({ locale: { language } }), 'zh-Hant');
  for (const language of ['en-US', 'fr']) assert.equal(resolveLanguage({ locale: { language } }), 'en');
  for (const language of ['zh-Hans', 'zh-CN', 'zh-Hans-TW', 'zh-SG']) assert.equal(resolveLanguage({ locale: { language } }), 'zh-Hans');
  assert.equal(resolveLanguage({ locale: { language: 'en' }, language: 'zh-TW' }), 'en');
  assert.equal(resolveLanguage({ language: 'zh-TW' }), 'zh-Hant');
  assert.equal(resolveLanguage(), 'en');
});
test('raw descriptors rerender in either language, including zero parameters', () => {
  const value = { code: 'acl_full', params: { used: 0, maximum: 3 } };
  assert.match(formatMessage(value, copy['zh-Hant']), /目標 ACL 已滿（0\/3）/);
  assert.match(formatMessage(value, copy.en), /ACL is full \(0\/3\)/);
  assert.match(formatMessage(value, copy['zh-Hans']), /目标 ACL 已满（0\/3）/);
  assert.match(formatMessage({ code: 'bindings_read_failed', params: { name: '$& Study' } }, copy['zh-Hant']), /\$& Study/);
});
test('unknown message codes and old servers have readable fallback', () => {
  assert.equal(formatMessage({ code: 'future_code', fallback: 'Readable fallback' }, copy.en), 'Readable fallback');
  assert.equal(formatMessage('Old server response', copy.en), 'Old server response');
  assert.equal(formatMessage({ code: 'future_code' }, copy['zh-Hant']), '要求的 Matter 操作失敗。');
});
test('wire decoding changes only known translatable fields, never device names', async () => {
  const raw = { message: 'English', message_i18n: { code: 'acl_reclaimed', params: { count: 2 } },
    steps: ['English step'], steps_i18n: [{ code: 'step_read_acl' }],
    source: { name: 'Study light', name_i18n: { code: 'unexpected_error' } } };
  const result = await studioCall({ callWS: async () => raw }, { type: 'test' });
  assert.equal(result.message.code, 'acl_reclaimed');
  assert.equal(result.steps[0].code, 'step_read_acl');
  assert.equal(result.source.name, 'Study light');
  assert.equal(raw.message, 'English');
  assert.deepEqual(decodeMessages({ message: 'Legacy' }), { message: 'Legacy' });
});
test('HA rejected promises and nested protocol errors retain descriptors', () => {
  const descriptor = { code: 'acl_full', params: { used: 3, maximum: 3 } };
  assert.equal(errorMessage({ code: 'plan_failed', message: 'English', studio_message: descriptor }), descriptor);
  assert.equal(errorMessage({ error: { studio_message: descriptor } }), descriptor);
  assert.equal(errorMessage(new Error('Legacy')), 'Legacy');
  assert.equal(errorMessage(null).code, 'unexpected_error');
});
