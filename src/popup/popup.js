(async function () {
  'use strict';
  const { t, localize, formatNumber } = globalThis.SerenoUI;
  const S = globalThis.SerenoSettings;

  localize();

  const $ = (id) => document.getElementById(id);
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  let settings = await S.load();

  function render() {
    $('enabled').checked = settings.enabled;
    $('masterState').textContent = t(settings.enabled ? 'popupOn' : 'popupOff');
    $('popup').classList.toggle('is-off', !settings.enabled);
    $('pausedHint').hidden = settings.enabled;
    for (const input of document.querySelectorAll('[data-setting]')) {
      input.checked = Boolean(get(settings, input.dataset.setting));
      input.disabled = !settings.enabled;
    }
  }

  async function renderStats() {
    const s = await S.loadStats();
    const today = s.network + s.smoke + s.muted;
    $('statToday').textContent = formatNumber(today);
    $('statNetwork').textContent = formatNumber(s.network);
    $('statSmoke').textContent = formatNumber(s.smoke);
    $('statMuted').textContent = formatNumber(s.muted);
    $('statTotal').textContent = s.total > today ? t('statTotal', [formatNumber(s.total)]) : '';
  }

  $('enabled').addEventListener('change', async (e) => {
    settings = await S.update('enabled', e.target.checked);
    render();
  });

  for (const input of document.querySelectorAll('[data-setting]')) {
    input.addEventListener('change', async () => {
      settings = await S.update(input.dataset.setting, input.checked);
      render();
    });
  }

  $('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[S.STATS_KEY]) renderStats();
  });

  render();
  renderStats();
})();
