export function parseGitHubEvent(event, payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const repo = payload.repository ? {
    name: payload.repository.full_name || payload.repository.name,
    url: payload.repository.html_url
  } : { name: 'Unknown Repo', url: '#' };

  const sender = payload.sender ? {
    name: payload.sender.login || 'Someone',
    avatar: payload.sender.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    url: payload.sender.html_url || '#'
  } : { name: 'Someone', avatar: '', url: '#' };

  switch (event) {
    case 'push': {
      const branch = (payload.ref || '').replace('refs/heads/', '');
      const commits = (payload.commits || []).map(c => ({
        hash: (c.id || '').substring(0, 7),
        message: (c.message || '').split('\n')[0],
        url: c.url,
        author: c.author?.name || sender.name
      }));

      // Ignore branch deletion pushes with 0 commits and deleted=true
      if (payload.deleted && commits.length === 0) {
        return {
          type: 'push_deleted',
          repo,
          sender,
          branch
        };
      }

      return {
        type: 'push',
        repo,
        sender,
        branch,
        commits,
        compareUrl: payload.compare || repo.url
      };
    }

    case 'pull_request': {
      const pr = payload.pull_request || {};
      const isMerged = Boolean(pr.merged && payload.action === 'closed');
      return {
        type: 'pull_request',
        action: isMerged ? 'merged' : payload.action,
        repo,
        sender,
        title: pr.title || 'Untitled PR',
        number: pr.number,
        url: pr.html_url,
        baseBranch: pr.base?.ref || 'main',
        headBranch: pr.head?.ref || 'feature',
        body: (pr.body || '').slice(0, 200)
      };
    }

    case 'issues': {
      const issue = payload.issue || {};
      return {
        type: 'issues',
        action: payload.action,
        repo,
        sender,
        title: issue.title || 'Untitled Issue',
        number: issue.number,
        url: issue.html_url,
        body: (issue.body || '').slice(0, 200)
      };
    }

    case 'watch':
    case 'star': {
      return {
        type: 'star',
        repo,
        sender,
        starsCount: payload.repository?.stargazers_count || 1
      };
    }

    case 'workflow_run': {
      const run = payload.workflow_run || {};
      return {
        type: 'workflow_run',
        repo,
        sender,
        workflowName: run.name || 'CI Pipeline',
        status: run.status,
        conclusion: run.conclusion || 'running',
        branch: run.head_branch || 'main',
        url: run.html_url
      };
    }

    case 'release': {
      const rel = payload.release || {};
      return {
        type: 'release',
        action: payload.action,
        repo,
        sender,
        tagName: rel.tag_name,
        name: rel.name || rel.tag_name,
        url: rel.html_url
      };
    }

    case 'ping': {
      return {
        type: 'ping',
        repo,
        sender,
        zen: payload.zen || 'Keep it logically awesome.'
      };
    }

    default:
      return {
        type: 'generic',
        event,
        repo,
        sender
      };
  }
}
