const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motionAllowed) document.documentElement.classList.add('js');

const directions = [...document.querySelectorAll('.switch button')];
const validDirections = new Set(directions.map(button => button.dataset.set));

function setDirection(direction, updateHistory = true) {
  if (!validDirections.has(direction)) return;
  document.documentElement.dataset.v = direction;
  directions.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.set === direction)));
  if (!updateHistory) return;
  const url = new URL(location.href);
  url.searchParams.set('v', direction);
  history.replaceState(null, '', url);
  document.querySelectorAll('a[href^="index.html"], a[href^="imprint.html"]').forEach(anchor => {
    const target = new URL(anchor.getAttribute('href'), location.href);
    target.searchParams.set('v', direction);
    anchor.href = `${target.pathname.split('/').pop()}${target.search}${target.hash}`;
  });
}
directions.forEach(button => button.addEventListener('click', () => setDirection(button.dataset.set)));
const navigation = document.querySelector('.nav-shell');
const menuButton = document.querySelector('.menu-btn');
const menuPanel = document.querySelector('.panel');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', menuButton.dataset.openLabel);
  menuPanel.setAttribute('aria-hidden', 'true');
}

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel);
    menuPanel.setAttribute('aria-hidden', String(!open));
  });
  menuPanel.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', closeMenu));
}
setDirection(document.documentElement.dataset.v, false);
if (new URLSearchParams(location.search).has('shots')) {
  document.documentElement.classList.add('hide-shots');
  document.querySelectorAll('.reveal, [data-words]').forEach(element => element.classList.add('in', 'on'));
} else if (motionAllowed && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const words = document.querySelector('[data-words]');
  if (words) {
    const wordNodes = words.textContent.split(' ').flatMap((text, index) => {
      const word = document.createElement('span');
      word.className = 'w';
      word.textContent = text;
      return index === 0 ? [word] : [document.createTextNode(' '), word];
    });
    words.replaceChildren(...wordNodes);
    const wordObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        wordObserver.unobserve(entry.target);
      }
    }), { rootMargin: '0px 0px -30% 0px' });
    words.querySelectorAll('.w').forEach(word => wordObserver.observe(word));
  }
} else {
  document.querySelectorAll('.reveal, [data-words]').forEach(element => element.classList.add('in', 'on'));
}
