export function formatTelegramPayload(parsedData, enablePersonality = true) {
  const { type, repo, sender } = parsedData;

  let text = '';

  switch (type) {
    case 'push': {
      const commitCount = parsedData.commits.length;
      text += `🐾 <b>[${escapeHtml(repo.name)}:${escapeHtml(parsedData.branch)}]</b>\n`;
      text += `(=^･ω･^=) <i>${commitCount} new commit${commitCount > 1 ? 's' : ''} pushed by <b>${escapeHtml(sender.name)}</b>:</i>\n\n`;

      const commitLines = parsedData.commits.slice(0, 6).map(c => {
        return `• <a href="${c.url}"><code>${c.hash}</code></a> ${escapeHtml(c.message)}`;
      });

      text += commitLines.join('\n');
      if (parsedData.commits.length > 6) {
        text += `\n<i>...and ${parsedData.commits.length - 6} more</i>`;
      }

      text += `\n\n<a href="${parsedData.compareUrl}">🔍 View Comparison</a>`;
      break;
    }

    case 'pull_request': {
      const isMerged = parsedData.action === 'merged';
      const icon = isMerged ? '🎉' : '📬';
      text += `${icon} <b>[${escapeHtml(repo.name)}] PR #${parsedData.number} ${parsedData.action.toUpperCase()}</b>\n`;
      text += `<b>Title:</b> <a href="${parsedData.url}">${escapeHtml(parsedData.title)}</a>\n`;
      text += `<b>Author:</b> ${escapeHtml(sender.name)}\n`;
      text += `<code>${escapeHtml(parsedData.baseBranch)}</code> ⟵ <code>${escapeHtml(parsedData.headBranch)}</code>\n`;
      if (parsedData.body) {
        text += `\n<i>"${escapeHtml(parsedData.body)}"</i>`;
      }
      break;
    }

    case 'star': {
      text += `⭐ (★ω★) <b>[${escapeHtml(repo.name)}] New Star!</b>\n\n`;
      text += `<b>${escapeHtml(sender.name)}</b> just starred <a href="${repo.url}">${escapeHtml(repo.name)}</a>!\n`;
      text += `Total stars: <b>${parsedData.starsCount}</b> ⭐`;
      break;
    }

    case 'workflow_run': {
      const isSuccess = parsedData.conclusion === 'success';
      const icon = isSuccess ? '✅' : '❌';
      text += `${icon} <b>[${escapeHtml(repo.name)}] Workflow ${escapeHtml(parsedData.workflowName)}</b>\n`;
      text += `Status: <b>${parsedData.conclusion.toUpperCase()}</b> on branch <code>${escapeHtml(parsedData.branch)}</code>\n`;
      text += `<a href="${parsedData.url}">View Workflow Run</a>`;
      break;
    }

    case 'issues': {
      text += `💬 <b>[${escapeHtml(repo.name)}] Issue #${parsedData.number} ${parsedData.action}</b>\n`;
      text += `<b>Title:</b> <a href="${parsedData.url}">${escapeHtml(parsedData.title)}</a>\n`;
      text += `<b>By:</b> ${escapeHtml(sender.name)}`;
      break;
    }

    case 'release': {
      text += `🚀 <b>[${escapeHtml(repo.name)}] Release: ${escapeHtml(parsedData.name || parsedData.tagName)}</b>\n`;
      text += `<a href="${parsedData.url}">View Release Details</a>`;
      break;
    }

    case 'ping': {
      text += `🐾 <b>MiawBot successfully connected!</b>\n`;
      text += `Repo: <code>${escapeHtml(repo.name)}</code>\n`;
      text += `<i>"${escapeHtml(parsedData.zen)}"</i>`;
      break;
    }

    default: {
      text += `🐾 <b>[${escapeHtml(repo.name)}] ${parsedData.event || 'Notification'}</b>\n`;
      text += `Triggered by ${escapeHtml(sender.name)}`;
    }
  }

  return {
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    text
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

