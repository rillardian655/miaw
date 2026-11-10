import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubEvent } from '../src/parsers/github.js';

describe('GitHub Webhook Payload Parser', () => {
  it('should parse push events correctly', () => {
    const payload = {
      ref: 'refs/heads/main',
      repository: { name: 'miaw', full_name: 'user/miaw', html_url: 'https://github.com/user/miaw' },
      commits: [
        { id: '1234567890abcdef', message: 'feat: add cool feature\n\nMore details', url: 'https://commit/1', author: { name: 'Alice' } }
      ],
      sender: { login: 'alice', avatar_url: 'https://avatar.png', html_url: 'https://github.com/alice' }
    };

    const parsed = parseGitHubEvent('push', payload);
    assert.equal(parsed.type, 'push');
    assert.equal(parsed.branch, 'main');
    assert.equal(parsed.commits.length, 1);
    assert.equal(parsed.commits[0].hash, '1234567');
    assert.equal(parsed.commits[0].message, 'feat: add cool feature');
  });

  it('should parse pull_request opened and merged events', () => {
    const payload = {
      action: 'opened',
      repository: { name: 'miaw', full_name: 'user/miaw' },
      pull_request: {
        number: 10,
        title: 'Fix typo in README',
        html_url: 'https://github.com/user/miaw/pull/10',
        body: 'Just fixing words',
        base: { ref: 'main' },
        head: { ref: 'fix/typo' },
        merged: false
      },
      sender: { login: 'bob' }
    };

    const opened = parseGitHubEvent('pull_request', payload);
    assert.equal(opened.type, 'pull_request');
    assert.equal(opened.action, 'opened');
    assert.equal(opened.number, 10);

    // Merged state
    payload.action = 'closed';
    payload.pull_request.merged = true;
    const merged = parseGitHubEvent('pull_request', payload);
    assert.equal(merged.action, 'merged');
  });

  it('should parse star / watch events', () => {
    const payload = {
      action: 'started',
      repository: { name: 'miaw', stargazers_count: 55 },
      sender: { login: 'stargazer' }
    };

    const parsed = parseGitHubEvent('watch', payload);
    assert.equal(parsed.type, 'star');
    assert.equal(parsed.starsCount, 55);
  });

  it('should parse workflow_run CI events', () => {
    const payload = {
      repository: { name: 'miaw' },
      workflow_run: {
        name: 'Unit Tests',
        status: 'completed',
        conclusion: 'success',
        head_branch: 'main',
        html_url: 'https://github.com/run/1'
      },
      sender: { login: 'github-actions' }
    };

    const parsed = parseGitHubEvent('workflow_run', payload);
    assert.equal(parsed.type, 'workflow_run');
    assert.equal(parsed.conclusion, 'success');
  });
});

