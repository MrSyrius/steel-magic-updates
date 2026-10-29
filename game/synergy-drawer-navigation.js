/* TEST 17.6 — one-button faction bonus drawer navigation. */
(() => {
  'use strict';
  const css = document.createElement('style');
  css.id = 'sm-synergy-drawer-navigation';
  css.textContent = `
    #faction-synergies-panel .btn-close-synergy { display:none!important; }
    #toggle-synergy-btn { transition: background .2s ease, color .2s ease; }
    #toggle-synergy-btn .sm-arrow { display:inline-block; transition:transform .3s ease; transform-origin:50% 50%; }
    #faction-synergies-panel:not(.hidden) #toggle-synergy-btn .sm-arrow { transform:rotate(180deg); }
  `;
  document.head.appendChild(css);
  function setup() {
    const panel = document.getElementById('faction-synergies-panel');
    const button = document.getElementById('toggle-synergy-btn');
    if (!panel || !button) return;
    button.innerHTML = '<span class="sm-arrow" aria-hidden="true">▶</span>';
    const sync = () => {
      const expanded = !panel.classList.contains('hidden');
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? 'Schowaj bonusy frakcji' : 'Pokaż bonusy frakcji');
      button.title = expanded ? 'Schowaj bonusy frakcji' : 'Pokaż bonusy frakcji';
    };
    window.toggleSynergyPanel = function(event) {
      if (event) event.stopPropagation();
      panel.classList.toggle('hidden');
      sync();
    };
    window.hideSynergyPanel = function() {
      panel.classList.add('hidden');
      sync();
    };
    new MutationObserver(sync).observe(panel, {attributes:true,attributeFilter:['class']});
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
