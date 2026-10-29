/* TEST16/17.6 staging adapter: injected only by isolated gateway. */
(() => {
  'use strict';
  if (window.__steelServerPvpBridge) return;
  window.__steelServerPvpBridge = true;
  const byId = id => document.getElementById(id);
  function closeArena() {
    const layer = byId('server-pvp-layer');
    if (layer) {
      const frame = layer.querySelector('iframe');
      if (frame) frame.src = 'about:blank';
      layer.remove();
    }
    byId('pvp-search-bubble')?.remove();
  }
  function openArena(mode, difficulty = 'easy') {
    if (!deckReady()) return;
    persistEngineSlot();
    try { sessionStorage.setItem('sm_engine_launch_slot', String(activeDeck + 1)); } catch (_) {}
    closeArena();
    const layer = document.createElement('section');
    layer.id = 'server-pvp-layer';
    layer.dataset.mode = mode;
    layer.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#101927;display:flex;flex-direction:column';
    const frame = document.createElement('iframe');
    frame.title = 'Arena PvP';
    frame.style.cssText = 'flex:1;width:100%;border:0;background:#111827';
    frame.src = '/pvp-preview?mode=' + encodeURIComponent(mode) +
      '&difficulty=' + encodeURIComponent(difficulty) +
      '&deck=' + encodeURIComponent(JSON.stringify(readEngineDeck() || []));
    layer.appendChild(frame);
    document.body.appendChild(layer);
    if (mode === 'ranked') {
      layer.style.display = 'none';
      const bubble = document.createElement('button');
      bubble.id = 'pvp-search-bubble';
      bubble.style.cssText = 'position:fixed;right:16px;bottom:85px;z-index:99998;border:1px solid #a58a60;border-radius:24px;background:#18283e;color:#e9d5a3;padding:12px 16px;font-weight:700';
      const started = Date.now();
      bubble.textContent = 'Szukanie przeciwnika… 0 s ✕';
      const timer = setInterval(() => {
        if (!bubble.isConnected) { clearInterval(timer); return; }
        bubble.textContent = 'Szukanie przeciwnika… ' + Math.floor((Date.now() - started) / 1000) + ' s ✕';
      }, 1000);
      bubble.onclick = closeArena;
      document.body.appendChild(bubble);
    }
  }
  function chooseTrainingDifficulty() {
    if (!deckReady()) return;
    document.getElementById('sm-ai-difficulty')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'sm-ai-difficulty';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#000b;display:flex;align-items:center;justify-content:center;padding:20px';
    const panel = document.createElement('div');
    panel.style.cssText = 'width:min(360px,100%);background:#1c2737;border:2px solid #b69a64;border-radius:14px;padding:20px;color:#f6e6c4;text-align:center;box-shadow:0 16px 50px #000a';
    const title = document.createElement('h2');
    title.textContent = 'Trening z AI — poziom trudności';
    title.style.cssText = 'font-size:19px;margin:0 0 15px';
    panel.appendChild(title);
    for (const [level,label] of [['easy','Łatwy — losowe decyzje'],['normal','Normalny — rozwój armii'],['hard','Trudny — inteligentne zakupy']]) {
      const button = document.createElement('button');
      button.textContent = label;
      button.style.cssText = 'display:block;width:100%;margin:9px 0;padding:13px;background:#33445a;color:#fff0c8;border:1px solid #a58a60;border-radius:9px;font-size:15px';
      button.onclick = () => { overlay.remove();openArena('training',level); };
      panel.appendChild(button);
    }
    const cancel = document.createElement('button');
    cancel.textContent = 'Anuluj';
    cancel.style.cssText = 'margin-top:10px;padding:10px 20px;background:transparent;color:#e8d8bb;border:1px solid #777;border-radius:8px';
    cancel.onclick = () => overlay.remove();
    panel.appendChild(cancel);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  // Season 2 roster from server_js/season_roster.json (35-44).
  const season2 = new Set(['sapper','runemage','ent','vampire','woodwarden','swordmaster','necromancer','hydra','demon','mantis']);
  function enforceSeasonOneDeck() {
    try {
      const clean = ids => Array.isArray(ids) ? ids.filter(id => !season2.has(id)) : [];
      const current = readEngineDeck() || [];
      if (current.some(id => season2.has(id))) {
        localStorage.setItem('gridclash_deck', JSON.stringify(clean(current)));
      }
      for (let slot = 1; slot <= 5; slot++) {
        const key = 'sm_deck_slot_' + slot;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const ids = JSON.parse(raw);
        if (Array.isArray(ids) && ids.some(id => season2.has(id))) localStorage.setItem(key, JSON.stringify(clean(ids)));
      }
    } catch (_) {}
  }
  function installSeasonLock() {
    if (typeof engineUnits === 'undefined' || typeof renderDeck !== 'function') return;
    enforceSeasonOneDeck();
    const originalChange = window.changeDeckUnit;
    if (typeof originalChange === 'function') window.changeDeckUnit = function(id) {
      if (season2.has(id)) return;
      return originalChange.apply(this, arguments);
    };
    const originalSwap = window.smReplaceDeckUnit;
    if (typeof originalSwap === 'function') window.smReplaceDeckUnit = function(id) {
      if (season2.has(id)) return;
      return originalSwap.apply(this, arguments);
    };
    const originalDetail = window.smDetailDeckAction;
    if (typeof originalDetail === 'function') window.smDetailDeckAction = function(id) {
      if (season2.has(id)) return;
      return originalDetail.apply(this, arguments);
    };
    const originalSelect = window.selectDeck;
    if (typeof originalSelect === 'function') window.selectDeck = function() {
      const result = originalSelect.apply(this, arguments);
      enforceSeasonOneDeck();
      renderDeck();
      if (typeof renderPlay === 'function') renderPlay();
      return result;
    };
    const originalRender = window.renderDeck;
    window.renderDeck = function() {
      enforceSeasonOneDeck();
      originalRender.apply(this, arguments);
      const collection = byId('collection');
      const locked = byId('locked-collection');
      if (!collection || !locked) return;
      locked.replaceChildren();
      for (const [id,name,icon] of engineUnits) {
        if (!season2.has(id)) continue;
        const tile = Array.from(collection.children).find(el => el.getAttribute('onclick') === "smOpenUnit('" + id + "')");
        const node = tile || document.createElement('button');
        if (!tile) {
          node.className = 'tile sm-rarity-' + (engineRarities[id] || 'zwykla');
          node.innerHTML = '<span class="sm-collection-portrait"></span><span class="sm-collection-caption"><b>' + name + '</b><b>' + engineCosts[id] + '💰</b></span>';
        }
        const portrait = node.querySelector('.sm-collection-portrait');
        if (portrait) {
          portrait.textContent = '';
          if (window.SteelCardAssets?.apply) window.SteelCardAssets.apply(portrait, id, false);
          else document.addEventListener('steel-card-assets-ready', () => window.SteelCardAssets?.apply(portrait, id, false), {once:true});
        }
        node.removeAttribute('onclick');
        node.setAttribute('disabled','');
        node.setAttribute('aria-label',name + ' — zablokowana do sezonu 2');
        node.style.cssText = 'opacity:.8;cursor:not-allowed';
        if (portrait) portrait.style.filter = 'grayscale(1) brightness(.6)';
        const mark = document.createElement('span');
        mark.textContent = '🔒 Sezon 2';
        mark.style.cssText = 'display:block;font-size:10px;color:#e9cf93;padding:3px';
        node.appendChild(mark);
        locked.appendChild(node);
      }
      locked.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px';
    };
    renderDeck();
    if (typeof renderPlay === 'function') renderPlay();
  }
  // The pinned TEST16 HTML still labels its main CTA as AI and binds battle(false).
  // Change only the APK integration's action/text at runtime; leave approved HTML/CSS intact.
  // Assigning onclick directly replaces the legacy inline handler in Android WebView.
  function wireRankedPlayCTA() {
    const rankedButton = document.querySelector('#play .play-cta');
    if (!rankedButton) return;
    rankedButton.textContent = '⚔ GRAJ — PvP (SERWER)';
    rankedButton.onclick = () => openArena('ranked');
  }
  wireRankedPlayCTA();
  installSeasonLock();

  window.chooseTrainingDifficulty = chooseTrainingDifficulty;
  window.friendBattle = function() { openArena('friend'); };
  window.battle = function(online = false) {
    if (online) { openArena('ranked'); return; }
    chooseTrainingDifficulty();
  };
  window.openServerBattle = function(mode = 'ranked', difficulty = 'easy') { openArena(mode, difficulty); };
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const layer = byId('server-pvp-layer');
    if (!layer || event.source !== layer.querySelector('iframe')?.contentWindow) return;
    if (event.data?.type === 'steel_pvp_match_assigned') {
      layer.style.display = 'flex';
      byId('pvp-search-bubble')?.remove();
    } else if (event.data?.type === 'steel_pvp_search_failed') {
      closeArena();
    } else if (event.data?.type === 'steel_pvp_return_menu') {
      closeArena();
      if (typeof switchTab === 'function') switchTab('play');
    }
  });
})();