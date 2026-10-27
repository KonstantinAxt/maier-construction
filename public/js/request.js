const form = document.querySelector('[data-request]');
if (form) {
  const copy = JSON.parse(document.querySelector('#request-text').textContent);
  const steps = [...form.querySelectorAll('[data-step]')];
  const progress = document.querySelector('[data-progress]');
  const alertBox = form.querySelector('[role="alert"]');
  const next = form.querySelector('[data-next]');
  const back = form.querySelector('[data-back]');
  const review = form.querySelector('[data-review]');
  const fallback = document.querySelector('[data-fallback]');
  const photoInput = form.elements.fotos;
  let active = 1;
  let files = [];

  const value = name => {
    const controls = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
    if (controls[0]?.type === 'radio') return controls.find(control => control.checked)?.value ?? '';
    if (controls[0]?.type === 'file') return files;
    return controls[0]?.value.trim() ?? '';
  };
  const field = name => form.querySelector(`[data-control="${CSS.escape(name)}"]`);
  const setError = (name, message) => {
    const control = field(name);
    if (!control) return;
    const error = control.querySelector('[data-error]');
    error.textContent = message;
    const inputs = control.querySelectorAll('input:not([type="file"]), textarea, select');
    inputs.forEach(input => {
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', error.id);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    });
  };
  const errorsFor = stepNumber => {
    const result = [];
    const step = steps[stepNumber - 1];
    for (const config of copy.steps[stepNumber - 1].fields) {
      let message = '';
      const current = value(config.name);
      const conditionMet = !config.requiredWhen || value(config.requiredWhen.name) === config.requiredWhen.value;
      if (config.name === 'fristdatum' && conditionMet && !current) message = copy.errors.required;
      else if (config.name === 'fristgrund' && conditionMet && !current) message = copy.errors.choice;
      else if (config.required && !current) message = config.type === 'radio' ? copy.errors.choice : copy.errors.required;
      else if (config.name === 'plz' && current && !/^\d{5}$/.test(current)) message = copy.errors.postal;
      else if (config.name === 'mail' && current && !form.elements.mail.validity.valid) message = copy.errors.email;
      if (stepNumber === 4 && config.name === 'telefon' && !current && !value('mail')) {
        result.push({ name: 'telefon', message: copy.errors.contact, element: field('telefon') });
        setError('telefon', copy.errors.contact);
        setError('mail', '');
      }
      else if (message) {
        result.push({ name: config.name, message, element: field(config.name) });
        setError(config.name, message);
      } else setError(config.name, '');
    }
    if (stepNumber === 4 && !value('telefon') && !value('mail') && !result.some(error => error.name === 'telefon')) {
      result.push({ name: 'telefon', message: copy.errors.contact, element: field('telefon') });
      setError('telefon', copy.errors.contact);
      setError('mail', '');
    }
    return result;
  };
  const updateProgress = () => {
    progress.textContent = copy.progress.replace('{n}', String(active)).replace('{total}', String(steps.length));
    steps.forEach((step, index) => { step.hidden = index + 1 !== active || active === 6; });
    form.querySelector('.request-step-body').hidden = active === 6;
    review.hidden = active !== 6;
    back.hidden = active === 1;
    next.hidden = active === 6;
    form.querySelector('[data-send]').hidden = active !== 6;
    next.textContent = active === 5 ? copy.buttons.review : copy.buttons.next;
    alertBox.hidden = true;
    alertBox.replaceChildren();
    if (active === 3 && value('frist') !== copy.steps[2].fields[0].yesValue) {
      ['fristdatum', 'fristgrund'].forEach(name => { field(name).hidden = true; });
    }
  };
  const showStep = (number, push = false, moveFocus = true) => {
    active = Math.max(1, Math.min(steps.length, number));
    updateProgress();
    if (active === 6) renderReview();
    if (push) history.pushState({ requestStep: active }, '', `#schritt-${active}`);
    if (moveFocus) {
      const heading = active === 6 ? review.querySelector('h2') : steps[active - 1].querySelector('legend');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    }
  };
  const validate = () => {
    const errors = errorsFor(active);
    if (!errors.length) return true;
    alertBox.hidden = false;
    alertBox.textContent = copy.errors.summary;
    const list = document.createElement('ul');
    errors.forEach(error => {
      const item = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = `#${error.name}`;
      anchor.textContent = error.message;
      anchor.addEventListener('click', event => {
        event.preventDefault();
        (error.element.querySelector('input, textarea, select') || error.element).focus();
      });
      item.append(anchor);
      list.append(item);
    });
    alertBox.append(list);
    alertBox.focus();
    return false;
  };
  const dateLabel = raw => {
    if (!raw) return '';
    const [year, month, day] = raw.split('-');
    return `${day}.${month}.${year}`;
  };
  const summaryRows = index => {
    const step = copy.steps[index];
    const labels = copy.labels;
    const mappings = [
      [['anlass', labels.occasion], ['schilderung', labels.description]],
      [['gebaeudetyp', labels.buildingType], ['address', labels.address], ['baujahr', labels.year]],
      [['frist', labels.deadline], ['rueckruf', labels.callback]],
      [['name', labels.name], ['telefon', labels.phone], ['mail', labels.email], ['rolle', labels.role]],
      [['fotos', copy.labels.photos]]
    ];
    const rows = mappings[index].map(([name, label]) => {
      let text = '';
      if (name === 'address') {
        const address = [value('strasse'), [value('plz'), value('ort')].filter(Boolean).join(' ')].filter(Boolean).join(', ');
        text = address;
      } else if (name === 'frist') text = value('frist') === copy.steps[2].fields[0].yesValue ? `${dateLabel(value('fristdatum'))} (${value('fristgrund')})` : value('frist');
      else if (name === 'fotos') text = files.length ? `${files.length} ${labels.attached}` : labels.none;
      else text = value(name);
      return text ? { label: label ?? '', text } : null;
    }).filter(Boolean);
    return rows;
  };
  const renderReview = () => {
    const container = form.querySelector('[data-summary]');
    container.replaceChildren();
    copy.steps.slice(0, 5).forEach((step, index) => {
      const section = document.createElement('section');
      section.className = 'request-summary-group';
      const heading = document.createElement('h3');
      heading.textContent = step.legend;
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'request-edit';
      edit.textContent = copy.buttons.edit;
      edit.addEventListener('click', () => showStep(index + 1, true));
      section.append(heading, edit);
      const list = document.createElement('dl');
      summaryRows(index).forEach(row => {
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = row.label;
        description.textContent = row.text;
        list.append(term, description);
      });
      section.append(list);
      container.append(section);
    });
  };
  const emailContent = (shared, cannotShareFiles = false) => {
    const labels = copy.labels;
    const sections = [
      [[labels.occasion, value('anlass')], [labels.description, value('schilderung')]],
      [[labels.buildingType, value('gebaeudetyp')], ...summaryRows(1).filter(row => row.label !== labels.buildingType && row.label !== labels.year).map(row => [row.label, row.text]), [labels.year, value('baujahr')]],
      [[labels.deadline, value('frist') === copy.steps[2].fields[0].yesValue ? `${dateLabel(value('fristdatum'))} (${value('fristgrund')})` : value('frist')], [labels.callback, value('rueckruf')]],
      [[labels.name, value('name')], [labels.phone, value('telefon')], [labels.email, value('mail')], [labels.role, value('rolle')]],
      [[null, cannotShareFiles && files.length ? labels.manual : files.length ? `${files.length} ${labels.attached}` : labels.none]]
    ];
    const body = sections.map((rows, index) => `${index ? '\r\n\r\n' : ''}${index + 1} ${copy.sections[index]}\r\n${rows.filter(([, text]) => text).map(([label, text]) => label ? `${label}: ${text}` : text).join('\r\n')}`).join('');
    return `${shared ? `${copy.labels.recipient.replace('{address}', copy.address)}\r\n${copy.labels.recipientName}\r\n` : ''}${copy.introLine}\r\n\r\n${body}`;
  };
  const subject = () => copy.subject.replace('{anlass}', value('anlass')).replace('{plz}', value('plz')).replace('{ort}', value('ort'));
  const showFallback = text => {
    fallback.hidden = false;
    fallback.querySelector('[data-fallback-text]').value = text;
    fallback.scrollIntoView({ block: 'start' });
    fallback.querySelector('[data-fallback-text]').focus();
  };
  const send = async () => {
    const canShareFiles = Boolean(files.length && navigator.canShare && navigator.canShare({ files }));
    const text = emailContent(canShareFiles);
    const title = subject();
    if (canShareFiles) {
      try { await navigator.share({ files, title, text }); } catch {}
    } else {
      const mail = document.createElement('a');
      mail.href = `mailto:${copy.address}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailContent(false, files.length > 0))}`;
      mail.className = 'request-mailto';
      mail.textContent = title;
      mail.setAttribute('aria-label', copy.buttons.send);
      document.querySelector('[data-send]').after(mail);
      mail.click();
    }
    showFallback(text);
  };
  const copyText = async (text, status) => {
    await navigator.clipboard.writeText(text);
    document.querySelector('[data-copy-status]').textContent = status;
  };
  next.addEventListener('click', () => {
    if (!validate()) return;
    showStep(active + 1, true);
  });
  back.addEventListener('click', () => showStep(active - 1, true));
  window.addEventListener('popstate', event => {
    const step = event.state?.requestStep ?? Number(location.hash.match(/^#schritt-(\d)$/)?.[1] ?? 1);
    showStep(step);
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'frist') {
      const enabled = value('frist') === copy.steps[2].fields[0].yesValue;
      ['fristdatum', 'fristgrund'].forEach(name => { field(name).hidden = !enabled; });
    }
    if (event.target === photoInput) {
      const selected = [...photoInput.files];
      files = selected.slice(0, 5);
      const list = form.querySelector('[data-files]');
      list.replaceChildren();
      files.forEach((file, index) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = file.name;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = copy.buttons.removePhoto;
        remove.addEventListener('click', () => {
          files.splice(index, 1);
          item.remove();
        });
        item.append(name, remove);
        list.append(item);
      });
      setError('fotos', selected.length > 5 ? copy.errors.files : '');
    }
  });
  document.querySelector('[data-send]').addEventListener('click', send);
  document.querySelector('[data-copy-text]').addEventListener('click', () => copyText(fallback.querySelector('[data-fallback-text]').value, copy.copied));
  document.querySelector('[data-copy-address]').addEventListener('click', () => copyText(copy.address, copy.addressCopied));
  form.querySelector('[data-noscript-send]').hidden = true;
  showStep(1, false, false);
}
