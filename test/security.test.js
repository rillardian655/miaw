import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyGitHubSignature } from '../src/services/security.js';

describe('GitHub HMAC Signature Verification', () => {
  const secret = 'super-secret-key-123';
  const body = Buffer.from(JSON.stringify({ ref: 'refs/heads/main' }));

  it('should accept valid sha256 signature', () => {
    const validHash = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const header = `sha256=${validHash}`;

    assert.equal(verifyGitHubSignature(secret, body, header), true);
  });

  it('should reject tampered or invalid signature', () => {
    const invalidHeader = 'sha256=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    assert.equal(verifyGitHubSignature(secret, body, invalidHeader), false);
  });

  it('should reject missing signature when secret is configured', () => {
    assert.equal(verifyGitHubSignature(secret, body, null), false);
    assert.equal(verifyGitHubSignature(secret, body, ''), false);
  });

  it('should pass through if no secret is configured (dev mode)', () => {
    assert.equal(verifyGitHubSignature('', body, null), true);
  });
});

