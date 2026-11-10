import crypto from 'node:crypto';

export function verifyGitHubSignature(secret, rawBody, signatureHeader) {
  if (!secret) {
    // If no secret configured, allow request (development mode)
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const trustedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(parts[1], 'hex');

  if (trustedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(trustedBuffer, receivedBuffer);
}

