(async function () {
  'use strict';
  const { t, localize } = globalThis.SerenoUI;
  const S = globalThis.SerenoSettings;

  localize();

  const $ = (id) => document.getElementById(id);
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  let settings = await S.load();
  let people = await S.loadPeople();

  if (new URLSearchParams(location.search).has('welcome')) $('welcome').hidden = false;
  $('version').textContent = t('version', [chrome.runtime.getManifest().version]);

  function toast() {
    const el = $('toast');
    el.hidden = true;
    void el.offsetWidth; // reinicia la animación
    el.hidden = false;
  }

  function render() {
    for (const input of document.querySelectorAll('input[type="checkbox"][data-setting]')) {
      input.checked = Boolean(get(settings, input.dataset.setting));
    }
    for (const input of document.querySelectorAll('input[type="radio"]')) {
      input.checked = String(get(settings, input.name)) === input.value;
    }
    for (const el of document.querySelectorAll('[data-depends]')) {
      el.classList.toggle('is-disabled', !get(settings, el.dataset.depends));
    }
    renderMuted();
    renderPeople();
  }

  function chip(label, onRemove, removeLabel) {
    const li = document.createElement('li');
    li.append(label);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', removeLabel);
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    btn.addEventListener('click', onRemove);
    li.append(btn);
    return li;
  }

  function renderPeople() {
    for (const [list, ul, empty] of [
      ['trusted', 'trustedList', 'trustedEmpty'],
      ['muted', 'peopleMutedList', 'peopleMutedEmpty']
    ]) {
      const entries = Object.entries(people[list]);
      $(ul).replaceChildren(
        ...entries.map(([id, name]) =>
          chip(name, async () => {
            people = await S.setPerson(id, '', null);
            renderPeople();
            toast();
          }, t('peopleRemove', [name]))
        )
      );
      $(empty).hidden = entries.length > 0;
    }
  }

  function renderMuted() {
    const list = $('mutedList');
    list.replaceChildren();
    for (const word of settings.muted.words) {
      const li = document.createElement('li');
      li.append(word);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', t('mutedRemove', [word]));
      btn.innerHTML =
        '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      btn.addEventListener('click', () => saveMuted(settings.muted.words.filter((w) => w !== word)));
      li.append(btn);
      list.append(li);
    }
    $('mutedEmpty').hidden = settings.muted.words.length > 0;
  }

  async function set(path, value) {
    settings = await S.update(path, value);
    render();
    toast();
  }

  async function saveMuted(words) {
    await set('muted.words', words);
  }

  for (const input of document.querySelectorAll('input[type="checkbox"][data-setting]')) {
    input.addEventListener('change', () => set(input.dataset.setting, input.checked));
  }
  for (const input of document.querySelectorAll('input[type="radio"]')) {
    input.addEventListener(
      'change',
      () => input.checked && set(input.name, input.dataset.type === 'number' ? Number(input.value) : input.value)
    );
  }

  $('mutedForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('mutedInput');
    const word = input.value.trim().replace(/\s+/g, ' ');
    input.value = '';
    if (!word) return;
    const exists = settings.muted.words.some((w) => w.toLowerCase() === word.toLowerCase());
    if (!exists) saveMuted([...settings.muted.words, word].slice(0, 200));
  });

  $('reset').addEventListener('click', async () => {
    if (!confirm(t('resetConfirm'))) return;
    settings = await S.save(S.DEFAULTS);
    render();
    toast();
  });

  // Si se cambia algo desde el popup, la página se mantiene al día.
  S.onChange((next) => {
    settings = next;
    render();
  });
  S.onPeopleChange((next) => {
    people = next;
    renderPeople();
  });

  render();
})();
