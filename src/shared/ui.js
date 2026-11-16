/* Sereno — utilidades de interfaz para popup y opciones. */
(function (root) {
  'use strict';

  function t(key, subs) {
    try {
      return chrome.i18n.getMessage(key, subs) || key;
    } catch (_) {
      return key;
    }
  }

  /** Reemplaza [data-i18n] (texto) y [data-i18n-<attr>] (atributos). */
  function localize(scope) {
    scope = scope || document;
    document.documentElement.lang = t('@@ui_locale').split('_')[0] || 'es';
    for (const el of scope.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of scope.querySelectorAll('*')) {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith('data-i18n-') && attr.name !== 'data-i18n') {
          el.setAttribute(attr.name.slice('data-i18n-'.length), t(attr.value));
        }
      }
    }
  }

  function formatNumber(n) {
    try {
      return new Intl.NumberFormat(t('@@ui_locale').replace('_', '-')).format(n);
    } catch (_) {
      return String(n);
    }
  }

  root.SerenoUI = { t, localize, formatNumber };
})(globalThis);
