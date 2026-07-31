const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
const themeIcon = themeButton.querySelector('span');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const languageGroup = document.querySelector('.segmented');
const languageButtons = [...document.querySelectorAll('[data-lang-option]')];
const copyButton = document.querySelector('#copy-qq');
const copyStatus = document.querySelector('#copy-status');

const pageStrings = {
  en: {
    navigation: 'Section navigation', language: 'Language',
    light: 'Switch to light theme', dark: 'Switch to dark theme',
    copy: 'Copy QQ: 2814823196', copied: 'QQ copied', copyFailed: 'Copy failed · QQ 2814823196'
  },
  zh: {
    navigation: '页面导航', language: '语言',
    light: '切换到浅色模式', dark: '切换到深色模式',
    copy: '复制 QQ：2814823196', copied: 'QQ 已复制', copyFailed: '复制失败 · QQ 2814823196'
  }
};

let pageI18n = null;
try {
  const el = document.getElementById('page-i18n');
  if (el) pageI18n = JSON.parse(el.textContent);
} catch (_) {}

function remember(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

function refreshControls() {
  const lang = root.dataset.lang === 'zh' ? 'zh' : 'en';
  const theme = root.dataset.theme === 'light' ? 'light' : 'dark';
  const copy = pageStrings[lang];
  const nextThemeLabel = theme === 'dark' ? copy.light : copy.dark;
  themeIcon.textContent = theme === 'dark' ? '☼' : '☾';
  themeButton.setAttribute('aria-label', nextThemeLabel);
  themeButton.title = nextThemeLabel;
  copyButton.title = copy.copy;
  languageGroup.setAttribute('aria-label', copy.language);
  document.querySelector('.rnav').setAttribute('aria-label', copy.navigation);
}

function setTheme(theme, persist = true) {
  root.dataset.theme = theme === 'light' ? 'light' : 'dark';
  themeMeta.content = root.dataset.theme === 'light' ? '#F6F7F8' : '#0A0C10';
  if (persist) remember('theme', root.dataset.theme);
  refreshControls();
}

function setLanguage(lang, persist = true) {
  root.dataset.lang = lang === 'zh' ? 'zh' : 'en';
  root.lang = root.dataset.lang === 'zh' ? 'zh-CN' : 'en';
  languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.langOption === root.dataset.lang)));
  const meta = pageI18n ? pageI18n[root.dataset.lang] : null;
  if (meta) {
    if (meta.title) {
      document.title = meta.title;
      document.querySelector('meta[property="og:title"]').content = meta.title;
    }
    if (meta.description) {
      document.querySelector('meta[name="description"]').content = meta.description;
      document.querySelector('meta[property="og:description"]').content = meta.description;
    }
  }
  copyStatus.textContent = '';
  if (persist) remember('lang', root.dataset.lang);
  refreshControls();
}

languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.langOption)));
themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
languageGroup.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  const i = languageButtons.indexOf(document.activeElement);
  if (i === -1) return;
  const dir = e.key === 'ArrowRight' ? 1 : -1;
  languageButtons[(i + dir + languageButtons.length) % languageButtons.length].click();
});

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Copy command failed');
}

copyButton.addEventListener('click', async () => {
  const copy = pageStrings[root.dataset.lang === 'zh' ? 'zh' : 'en'];
  try {
    await copyText(copyButton.dataset.copy);
    copyStatus.textContent = copy.copied;
  } catch (_) {
    copyStatus.textContent = copy.copyFailed;
  }
  window.setTimeout(() => { copyStatus.textContent = ''; }, 2200);
});

setTheme(root.dataset.theme || 'dark', false);
setLanguage(root.dataset.lang || 'en', false);
