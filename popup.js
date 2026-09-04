document.getElementById('downloadBtn').addEventListener('click', async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes('claude.ai')) {
    alert('Please open a conversation with Claude.ai');
    return;
  }

  const btn = document.getElementById('downloadBtn');
  btn.innerText = 'Live Scanning...';
  btn.disabled = true;

  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeClaudeContinuous
    });
  } catch (err) {
    console.error(err);
    alert('Error extracting...');
  } finally {
    btn.innerText = 'Download Conversation';
    btn.disabled = false;
  }
});

async function scrapeClaudeContinuous() {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const feedContainer = document.querySelector('[role="feed"]') || document.querySelector('[role="log"]');
  if (!feedContainer) {
    alert('Conversation not found.');
    return;
  }

  function getScrollableAncestor(element) {
    let parent = element.parentElement;
    while (parent) {
      const overflow = window.getComputedStyle(parent).overflowY;
      if ((overflow === 'auto' || overflow === 'scroll') && parent.scrollHeight > parent.clientHeight) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return document.documentElement;
  }

  const scroller = getScrollableAncestor(feedContainer);
  
  // Go top
  while (scroller.scrollTop > 0) {
    scroller.scrollTop = Math.max(0, scroller.scrollTop - 2000);
    await sleep(100);
  }
  await sleep(1000); 

  let allMessages = [];
  let reachedBottom = false;
  let lastScrollTop = -1;

  // Scroll and capture
  while (!reachedBottom) {
    let articles = feedContainer.querySelectorAll('[role="article"], .group\\/conversation-turn');
    if (articles.length === 0) articles = feedContainer.children;

    Array.from(articles).forEach((article) => {
      const text = article.innerText.trim();
      if (!text) return;

      const isUser = article.querySelector('.font-user-message') !== null || 
                     article.querySelector('[data-is-user="true"]') !== null ||
                     text.startsWith('Human:');
      
      const role = isUser ? '=== [USER] ===' : '=== [CLAUDE] ===';

      // Filter duplicates
      let isDuplicate = false;
      const searchRange = Math.max(0, allMessages.length - 20); 
      for (let i = searchRange; i < allMessages.length; i++) {
        if (allMessages[i].text === text) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        allMessages.push({ role, text });
      }
    });

    scroller.scrollTop += 600;
    await sleep(350);

    // Bottom reach
    if (scroller.scrollTop === lastScrollTop || Math.ceil(scroller.scrollTop) + scroller.clientHeight >= scroller.scrollHeight - 2) {
      reachedBottom = true;
    }
    lastScrollTop = scroller.scrollTop;
  }

  if (allMessages.length === 0) {
    alert('Empty conversation');
    return;
  }

  let fullContent = "";
  allMessages.forEach(msg => {
    fullContent += `${msg.role}\n\n${msg.text}\n\n${'='.repeat(40)}\n\n`;
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `claude-chat-${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
