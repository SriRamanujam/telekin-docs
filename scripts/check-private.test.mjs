import test from 'node:test';
import assert from 'node:assert/strict';
import { hasBadIPv4, hasInternalHostname, hasBearerToken } from './private-patterns.mjs';

test('bearer token', () => {
  assert.equal(hasBearerToken('Authorization: Bearer <your key>'), false);
  assert.equal(hasBearerToken('Authorization: Bearer ${KEY}'), false);
  assert.equal(hasBearerToken('Authorization: Bearer YOUR_API_KEY'), false);
  assert.equal(hasBearerToken('Authorization: Bearer <key>'), false);
  assert.equal(hasBearerToken('the word Bearer matters'), false);
  assert.equal(hasBearerToken('Use Bearer authentication here'), false);
  assert.equal(hasBearerToken('Authorization: Bearer your-api-key'), false);
  assert.equal(hasBearerToken('Bearer your-key-here'), false);
  assert.equal(hasBearerToken('bearer abcdef1234567890abcd'), true);
  assert.equal(hasBearerToken('Authorization: BEARER abcdef1234567890abcd'), true);
});

test('IPv4', () => {
  assert.equal(hasBadIPv4('host 192.0.2.10'), false);
  assert.equal(hasBadIPv4('198.51.100.7'), false);
  assert.equal(hasBadIPv4('203.0.113.200'), false);
  assert.equal(hasBadIPv4('http://127.0.0.1:8080'), false);
  assert.equal(hasBadIPv4('0.0.0.0'), false);
  assert.equal(hasBadIPv4('999.1.1.1'), false);
  assert.equal(hasBadIPv4('10.1.2.3'), true);
  assert.equal(hasBadIPv4('1.2.3.4'), true);
  assert.equal(hasBadIPv4('ip is 8.8.8.8.'), true);
});

test('internal hostname', () => {
  assert.equal(hasInternalHostname('see settings.local.json'), false);
  assert.equal(hasInternalHostname('.claude/settings.local.json'), false);
  assert.equal(hasInternalHostname('docs.example.com'), false);
  assert.equal(hasInternalHostname('connect to box.internal'), true);
  assert.equal(hasInternalHostname('http://nas.lan:8080/x'), true);
  assert.equal(hasInternalHostname('printer.local.'), true);
  assert.equal(hasInternalHostname('router.home.arpa'), true);
});
