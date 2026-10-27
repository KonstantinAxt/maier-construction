export const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

const icon = name => `<svg class="icon" aria-hidden="true"><use href="img/icons.svg#${esc(name)}"></use></svg>`;
const link = (target, label, className = '') => `<a${className ? ` class="${esc(className)}"` : ''} href="${target.startsWith('#') || target.startsWith('index.html') ? esc(target) : `#${esc(target)}`}">${label}</a>`;
const image = ({ src, alt }) => `<img src="${esc(src)}" alt="${esc(alt)}">`;
const address = contactAddress => contactAddress.display;
const displayedNumber = number => `${number.slice(0, 4)} ${number.slice(4)}`;
const legalNumber = number => `${number.slice(0, 4)}-${number.slice(4)}`;
const tel = number => `+49${number.slice(1)}`;
const contactValue = (contact, key) => ({
  owner: contact.owner,
  legalStreet: contact.address.legalDisplay,
  locality: contact.address.display.split(', ').slice(1).join(' '),
  mobileLegal: `${contact.mobile.label}: ${legalNumber(contact.mobile.number)}`,
  phoneLegal: `${contact.phone.label}: ${legalNumber(contact.phone.number)}`,
  email: contact.mail.address
})[key];

function switcher(site) {
  if (site.directions.length < 2) return '';
  return `<div class="switch" role="group" aria-label="${esc(site.labels.variant)}">${site.directions.map(({ id, label }) => `<button type="button" data-set="${esc(id)}" aria-pressed="false">${esc(label)}</button>`).join('')}</div>`;
}

function navigation(site, page) {
  const primaryLinks = site.nav.links.map(item => `<li><a href="${page === 'imprint' ? `index.html#${item.target}` : `#${item.target}`}">${esc(item.label)}</a></li>`).join('');
  const menuLinks = [...site.nav.links, { target: 'kontakt', label: site.nav.cta }].map(item => `<a href="${page === 'imprint' ? `index.html#${item.target}` : `#${item.target}`}">${esc(item.label)}</a>`).join('');
  const home = page === 'imprint' ? 'index.html#top' : '#top';
  const ctaTarget = page === 'imprint' ? 'index.html#kontakt' : 'kontakt';
  return `<header class="nav-shell"><nav class="nav" aria-label="${esc(site.labels.mainNavigation)}">
    <a class="brand" href="${home}" aria-current="page">${icon('house-line')}<span>${esc(site.nav.brand)}</span></a>
    <ul>${primaryLinks}</ul>
    ${link(ctaTarget, esc(site.nav.cta), 'btn sm')}
    <button class="menu-btn" type="button" aria-label="${esc(site.labels.openMenu)}" data-open-label="${esc(site.labels.openMenu)}" data-close-label="${esc(site.labels.closeMenu)}" aria-expanded="false"><span></span><span></span></button>
  </nav><div class="panel" aria-hidden="true">${menuLinks}</div></header>`;
}

function footer(site) {
  return `<footer><div class="wrap"><span>${esc(site.footer.copyright)}</span><nav aria-label="${esc(site.labels.legalNavigation)}"><a href="imprint.html">${esc(site.footer.imprint)}</a><a href="imprint.html#datenschutz">${esc(site.footer.privacy)}</a></nav></div></footer>`;
}

function hero(site) {
  const h = site.hero;
  const strips = h.media.c.map(image).join('');
  return `<section class="hero" id="top">
    <div class="hero-photo-full">${image(h.media.b)}</div>
    <div class="wrap"><div>
      <span class="eyebrow">${esc(h.eyebrow)}</span>
      <h1>${h.title.map(esc).join('<br>')}</h1>
      <p class="sub">${esc(h.text)}</p>
      <div class="cta-row">
        ${link('kontakt', `${esc(h.cta)} ${icon('arrow-right')}`, 'btn cta-main')}
        <a class="btn call-big" href="tel:${esc(tel(site.contact.mobile.number))}">${icon('phone')} ${esc(site.contact.mobile.display)} ${esc(h.callLabel)}</a>
        <span class="proof">${icon('seal-check-fill')} ${esc(h.proof)}</span>
      </div>
    </div>
    <div class="hero-media">${image(h.media.a)}</div>
    <div class="hero-strip" aria-hidden="true">${strips}</div>
    </div></section>`;
}

function expertise(site) {
  const section = site.gutachten;
  const services = section.services.map(item => `<li>${icon(item.icon)}<h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></li>`).join('');
  return `<section class="section reveal" id="gutachten"><div class="wrap expert"><div>
    <span class="eyebrow">${esc(section.eyebrow)}</span><h2 class="h2">${esc(section.heading)}</h2><p class="lead">${esc(section.text)}</p>
    <div class="cta-row">${link('kontakt', `${esc(section.cta)} ${icon('arrow-right')}`, 'btn')}</div>
    </div><ul class="expert-list">${services}</ul></div></section>`;
}

function process(site) {
  const section = site.ablauf;
  const steps = section.steps.map((step, index) => `<li><span class="n">${String(index + 1).padStart(2, '0')}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join('');
  return `<section class="section expert-band reveal" id="ablauf"><div class="wrap">
    <span class="eyebrow">${esc(section.eyebrow)}</span><h2 class="h2">${esc(section.heading)}</h2><ol class="steps">${steps}</ol>
    </div></section>`;
}

function services(site) {
  const section = site.spenglerei;
  const cards = section.services.map(item => `<article class="card">${image(item.image)}<div class="body"><div class="ico">${icon(item.icon)}</div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><ul>${item.items.map(label => `<li>${icon('check')}<span>${esc(label)}</span></li>`).join('')}</ul></div></article>`).join('');
  return `<section class="section reveal" id="spenglerei"><div class="wrap">
    <span class="eyebrow">${esc(section.eyebrow)}</span><h2 class="h2">${esc(section.heading)}</h2><p class="lead">${esc(section.text)}</p><div class="services">${cards}</div>
    </div></section>`;
}

function projects(site) {
  const section = site.projects;
  return `<section class="section reveal" id="projekte"><div class="wrap">
    <span class="eyebrow">${esc(section.eyebrow)}</span><h2 class="h2">${esc(section.heading)}</h2><div class="gallery">${section.images.map(image).join('')}</div>
    </div></section>`;
}

function faq(site) {
  const section = site.faq;
  const items = section.items.map((item, index) => `<details${index === 0 ? ' open' : ''}><summary>${esc(item.q)}${icon('plus')}</summary><p>${esc(item.a)}</p></details>`).join('');
  return `<section class="section reveal" id="fragen"><div class="wrap faq"><div><span class="eyebrow">${esc(section.eyebrow)}</span><h2 class="h2">${esc(section.heading)}</h2><p class="lead">${esc(section.intro)}</p></div><div>${items}</div></div></section>`;
}

function contact(site) {
  const c = site.contact;
  return `<section class="section reveal" id="kontakt"><div class="wrap"><div class="contact"><div>
    <span class="eyebrow">${esc(c.eyebrow)}</span><h2 class="h2">${esc(c.heading)}</h2><p class="lead">${esc(c.text)}</p>
    <div class="cta-row"><a class="btn" href="mailto:${esc(c.mail.address)}?subject=${encodeURIComponent(c.mail.subject)}">${esc(c.cta)} ${icon('arrow-right')}</a></div>
    <p class="risk">${icon('shield-check')} ${esc(c.risk)}</p></div><dl>
    <div><dt>${esc(c.mobile.label)}</dt><dd><a href="tel:${esc(tel(c.mobile.number))}">${esc(displayedNumber(c.mobile.number))}</a></dd></div>
    <div><dt>${esc(c.phone.label)}</dt><dd><a href="tel:${esc(tel(c.phone.number))}">${esc(displayedNumber(c.phone.number))}</a></dd></div>
    <div><dt>${esc(c.mail.label)}</dt><dd><a href="mailto:${esc(c.mail.address)}">${esc(c.mail.address)}</a></dd></div>
    <div><dt>${esc(c.address.label)}</dt><dd>${esc(address(c.address))}</dd></div>
    </dl></div></div></section>`;
}

function legalParagraph(paragraph, contact) {
  return `<p>${paragraph.parts.map(part => {
    const text = part.contactRef ? contactValue(contact, part.contactRef) : part.text;
    const value = part.strong ? `<strong>${esc(text)}</strong>` : esc(text);
    const content = part.href ? `<a href="${esc(part.href === 'mailto' ? `mailto:${text}` : part.href)}">${value}</a>` : value;
    return esc(text).includes('\n') ? content.split('\n').join('<br>') : content;
  }).join('')}</p>`;
}

function legalGroup(group, { anchor = '', headingLevel = 2 } = {}, contact) {
  const heading = group.heading ? `<h${headingLevel}>${esc(group.heading)}</h${headingLevel}>` : '';
  return `<section${anchor ? ` id="${esc(anchor)}"` : ''}>${heading}${group.paragraphs.map(paragraph => legalParagraph(paragraph, contact)).join('')}</section>`;
}
function imprintBody(site, legal) {
  const contact = site.contact;
  const imprint = legal.imprint.sections[0];
  const standard = imprint.paragraphs.map(paragraph => legalParagraph(paragraph, contact)).join('');
  const liability = legal.liability.sections.map(group => legalGroup(group, {}, contact)).join('');
  const privacy = legal.privacy.sections.map(group => legalGroup({ heading: legal.privacy.heading, ...group }, { anchor: 'datenschutz' }, contact)).join('');
  const credits = legal.credits.paragraphs.map(paragraph => legalParagraph(paragraph, contact)).join('');
  return `<main id="inhalt" class="legal-page"><div class="wrap"><a class="legal-back" href="index.html#top">${esc(site.labels.back)}</a>
    <h1>${esc(legal.imprint.heading)}</h1>${standard}
    <h2>${esc(legal.liability.heading)}</h2>${liability}${privacy}
    <div class="legal-credits">${credits}</div>
    </div></main>`;
}
function shell({ site, legal }, page, content) {
  const title = page === 'index' ? site.title : `${legal.imprint.heading} | ${site.owner}`;
  const description = page === 'index' ? `<meta name="description" content="${esc(site.description)}">` : '';
  const main = page === 'index'
    ? `<main id="inhalt">${hero(site)}${expertise(site)}${process(site)}<section class="tagline"><div class="wrap"><p data-words>${esc(site.tagline)}</p></div></section>${services(site)}${projects(site)}${faq(site)}${contact(site)}</main>`
    : content;
  const headScript = `<script>const variants=${JSON.stringify(site.directions.map(({ id }) => id))};const requested=new URLSearchParams(location.search).get('v');document.documentElement.dataset.v=variants.includes(requested)?requested:variants[0];if(new URLSearchParams(location.search).has('shots'))document.documentElement.classList.add('hide-shots');</script>`;
  return `<!-- generated from content/de/*.json by build/build.mjs, do not edit -->
<!doctype html>
<html lang="${esc(site.language)}" data-v="${esc(site.directions[0].id)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description}
<link rel="canonical" href="${page === 'index' ? 'index.html' : 'imprint.html'}">
${headScript}
<link rel="stylesheet" href="style/base.css">
${site.directions.map(({ id }) => `<link rel="stylesheet" href="style/direction-${esc(id)}.css">`).join('\n')}
</head>
<body>
<a class="skip" href="#inhalt">${esc(site.labels.skip)}</a>
${navigation(site, page)}
${main}
${footer(site)}
<a class="callbar" href="tel:${esc(tel(site.contact.mobile.number))}">${icon('phone')} ${esc(site.labels.nowCall)}</a>
${switcher(site)}
<script src="js/site.js" defer></script>
</body>
</html>
`;
}

export function renderIndex(content) {
  return shell(content, 'index', '');
}

export function renderImprint(content) {
  return shell(content, 'imprint', imprintBody(content.site, content.legal));
}
