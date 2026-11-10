const CAT_REACTIONS = {
  push: ['(=^･ω･^=) *New commits just landed!*', '🐾 *Paws on keyboard! Fresh code pushed!*'],
  pr_opened: ['(=^-ω-^=) *A new Pull Request arrived for review!*', '🐾 *New PR detected!*'],
  pr_merged: ['🎉 (=^･ｪ･^=) *PR successfully merged! Good job!*'],
  star: ['⭐ (★ω★) *Purrrrr! Someone starred the repository!*', '🌟 (=^･ω･^=) *Yay! A shiny new star!*'],
  ci_success: ['✅ (=^･ω･^=) *Purrfect! All CI checks passed!*'],
  ci_failure: ['😿 (>_<) *Sad meow... CI workflow failed!*'],
  issue: ['💬 (ㅇㅅㅇ) *New issue opened!*']
};

function randomReaction(list) {
  if (!list || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function formatDiscordPayload(parsedData, enablePersonality = true) {
  const { type, repo, sender } = parsedData;

  const embed = {
    color: 0x5865f2,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'MiawBot Webhook Notifier 🐾',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png'
    }
  };

  switch (type) {
    case 'push': {
      embed.color = 0x2ecc71; // Green
      const reaction = enablePersonality ? randomReaction(CAT_REACTIONS.push) + '\n\n' : '';
      const commitCount = parsedData.commits.length;
      embed.title = `[${repo.name}:${parsedData.branch}] ${commitCount} new commit${commitCount > 1 ? 's' : ''}`;
      embed.url = parsedData.compareUrl;
      embed.author = {
        name: sender.name,
        icon_url: sender.avatar,
        url: sender.url
      };

      const commitLines = parsedData.commits.slice(0, 8).map(c => {
        return `[\`${c.hash}\`](${c.url}) ${c.message} - *${c.author}*`;
      });

      if (parsedData.commits.length > 8) {
        commitLines.push(`*...and ${parsedData.commits.length - 8} more commits*`);
      }

      embed.description = `${reaction}${commitLines.join('\n')}`;
      break;
    }

    case 'pull_request': {
      const isMerged = parsedData.action === 'merged';
      embed.color = isMerged ? 0x9b59b6 : 0x3498db; // Purple or Blue
      const reaction = enablePersonality
        ? (isMerged ? randomReaction(CAT_REACTIONS.pr_merged) : randomReaction(CAT_REACTIONS.pr_opened)) + '\n\n'
        : '';

      embed.title = `[${repo.name}] Pull Request #${parsedData.number} ${parsedData.action}: ${parsedData.title}`;
      embed.url = parsedData.url;
      embed.author = {
        name: sender.name,
        icon_url: sender.avatar,
        url: sender.url
      };
      embed.description = `${reaction}${parsedData.body ? `> ${parsedData.body}\n\n` : ''}` +
        `**Base:** \`${parsedData.baseBranch}\` ⟵ **Head:** \`${parsedData.headBranch}\``;
      break;
    }

    case 'star': {
      embed.color = 0xf1c40f; // Gold
      const reaction = enablePersonality ? randomReaction(CAT_REACTIONS.star) + '\n\n' : '';
      embed.title = `[${repo.name}] New Star Added! ⭐`;
      embed.url = repo.url;
      embed.author = {
        name: sender.name,
        icon_url: sender.avatar,
        url: sender.url
      };
      embed.description = `${reaction}**${sender.name}** just starred **[${repo.name}](${repo.url})**!\nTotal stars: **${parsedData.starsCount}** ⭐`;
      break;
    }

    case 'workflow_run': {
      const isSuccess = parsedData.conclusion === 'success';
      embed.color = isSuccess ? 0x2ecc71 : 0xe74c3c; // Green or Red
      const reaction = enablePersonality
        ? (isSuccess ? randomReaction(CAT_REACTIONS.ci_success) : randomReaction(CAT_REACTIONS.ci_failure)) + '\n\n'
        : '';

      embed.title = `[${repo.name}] Workflow ${parsedData.workflowName}: ${parsedData.conclusion.toUpperCase()}`;
      embed.url = parsedData.url;
      embed.description = `${reaction}**Branch:** \`${parsedData.branch}\`\n**Status:** ${parsedData.status} (${parsedData.conclusion})`;
      break;
    }

    case 'issues': {
      embed.color = 0xe67e22; // Orange
      const reaction = enablePersonality ? randomReaction(CAT_REACTIONS.issue) + '\n\n' : '';
      embed.title = `[${repo.name}] Issue #${parsedData.number} ${parsedData.action}: ${parsedData.title}`;
      embed.url = parsedData.url;
      embed.author = {
        name: sender.name,
        icon_url: sender.avatar,
        url: sender.url
      };
      embed.description = `${reaction}${parsedData.body ? `> ${parsedData.body}` : ''}`;
      break;
    }

    case 'release': {
      embed.color = 0x2ecc71;
      embed.title = `[${repo.name}] Release Published: ${parsedData.name || parsedData.tagName} 🚀`;
      embed.url = parsedData.url;
      embed.description = `🐾 A new release was published by **${sender.name}**!`;
      break;
    }

    case 'ping': {
      embed.color = 0x5865f2;
      embed.title = `[${repo.name}] Webhook Connection Verified! 🐾`;
      embed.description = `(=^･ω･^=) *MiawBot successfully connected to GitHub!*\n\n> *"${parsedData.zen}"*`;
      break;
    }

    default: {
      embed.title = `[${repo.name}] Event: ${parsedData.event || 'Notification'}`;
      embed.description = `Event received from ${sender.name}.`;
    }
  }

  return {
    username: 'MiawBot 🐾',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    embeds: [embed]
  };
}

