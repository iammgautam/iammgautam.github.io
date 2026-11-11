const root = document.documentElement;
root.classList.add('js');

// Theme: one toggle, choice remembered. Default follows the OS.
document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

// Header border once scrolled.
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll + run latency bars when visible.
const latency = document.querySelector('[data-latency]');
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    if (e.target === latency) latency.classList.add('is-run');
    io.unobserve(e.target);
  }
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

document.querySelector('[data-replay]').addEventListener('click', () => {
  latency.classList.remove('is-run');
  void latency.offsetWidth; // restart transition
  latency.classList.add('is-run');
});

// Active nav link for the section in view.
const links = new Map([...document.querySelectorAll('.nav a')].map((a) => [a.hash.slice(1), a]));
const navIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach((a) => a.removeAttribute('aria-current'));
    links.get(e.target.id)?.setAttribute('aria-current', 'true');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });

// Copy email with inline feedback; falls back to mailto link if clipboard is blocked.
const copyBtn = document.querySelector('[data-copy]');
const label = copyBtn.querySelector('[data-copy-label]');
const status = document.querySelector('[data-copy-status]');
let t;
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    label.textContent = 'Copied';
    status.textContent = 'Email copied to clipboard';
    copyBtn.classList.add('is-done');
  } catch {
    label.textContent = 'Couldn’t copy. Use the link.';
    status.textContent = 'Couldn’t copy. Select the email address instead.';
  }
  clearTimeout(t);
  t = setTimeout(() => {
    label.textContent = 'Copy email';
    status.textContent = '';
    copyBtn.classList.remove('is-done');
  }, 2000);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
