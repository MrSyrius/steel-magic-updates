/* Steel & Magic: optional portrait adapter. Images are served separately from /game/cards/.
   Does not change deck IDs, deck storage, or the approved layout. */
(function () {
  'use strict';
  const aliases = {
    sword:'miecznik',pik:'pikinier',archer:'lucznik',sapper:'saper',
    bannerbearer:'chorazy',knight:'rycerz',treasurer:'skarbnik',
    cav:'kawaleria',runemage:'mag_runiczny',inquisitor:'inkwizytor',
    cat:'katapulta',priest:'kaplanka',paladin:'paladyn_kobieta',
    swordmaster:'mistrz_miecza',general:'general',
    axe:'topornik_mroku',cultist:'kultysta',reaper:'zniwiarz_mroku',
    assassin:'zabojczyni_mroku',darkspearman:'oszczepniczka_mroku',
    cross:'kusznik_mroku',alch:'alchemiczka_mroku',
    shadowhunter:'lowca_cieni',vampire:'wampir_mroku',
    shadowmage:'czarownica_cieni',mage:'mag_mroku',
    necromancer:'nekromanta',golem:'golem_mroku',
    demon:'demon_mroku',executioner:'egzekutor_mroku',
    dog:'pies_bestie',snake:'waz_bestie',slasher:'szarpak_bestie',spider_web:'pajak_bestie',
    goblin:'goblin_bestie',wolf:'wilk_bestie',basilisk:'bazyliszek_bestie',
    troll:'troll_bestie',ogre:'ogr_bestie',ent:'ent_bestie',bear:'niedzwiedz_bestie',
    hydra:'hydra_bestie',kraken:'kraken_bestie',woodwarden:'borowy_bestie',
    mantis:'modliszka_bestie'
  };
  let records = Object.create(null);
  let ready = false;
  let pendingInit = null;
  const norm = x => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const root = '/game/';
  function url(path) {
    if (typeof path !== 'string' || !/^cards\/[a-zA-Z0-9_./-]+\.webp$/.test(path) || path.includes('..')) return null;
    return root + path;
  }
  async function init() {
    if (ready) return true;
    if (pendingInit) return pendingInit;
    pendingInit = loadManifest();
    try { return await pendingInit; }
    finally { pendingInit = null; }
  }
  async function loadManifest() {
    try {
      const res = await fetch(root+'cards/deck_assets.json', {cache:'no-store'});
      if (!res.ok) return false;
      const json = await res.json();
      if (json.schema !== 1 || !Array.isArray(json.units)) return false;
      records = Object.create(null);
      for (const unit of json.units) {
        if (!unit.id) continue;
        records[unit.id] = unit;
        records[norm(unit.id)] = unit;
        records[norm(unit.name)] = unit;
      }
      records.mag_runiczny = {id:'mag_runiczny',name:'Mag Runiczny',shopIcon:'cards/shop-icons/mag-runiczny.webp',thumbnail:'cards/shop-icons/mag-runiczny.webp',portrait:'cards/grafiki/portrait/Mag_Runiczny_Kadr.webp'};
      ready = true;
      document.dispatchEvent(new Event('steel-card-assets-ready'));
      return true;
    } catch (_) { return false; }
  }
  function get(id) {
    const key = aliases[id] || id;
    return records[key] || records[norm(key)] || records[id] || records[norm(id)] || null;
  }
  function apply(element, id, full) {
    if (!element) return false;
    const item = get(id);
    // Portraits are the only guaranteed deployed assets for deck and collection.
    // The optional shopIcon/thumbnail entries can point to unavailable folders.
    const src = item && url(item.portrait || (full ? null : (item.thumbnail || item.shopIcon)));
    if (!src) return false; // Keep existing placeholder, e.g. Mag Runiczny.
    const img = document.createElement('img');
    img.alt = item.name || String(id);
    img.loading = 'eager';
    img.decoding = 'async';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover';
    // Lazy images must be attached to the DOM before the browser will load them.
    // Keep the original icon visible until the request succeeds.
    img.style.opacity = '0';
    img.style.position = 'absolute';
    img.style.inset = '0';
    element.style.position = 'relative';
    img.onerror = () => { img.remove(); };
    img.onload = () => {
      img.style.opacity = '1';
      img.style.position = 'static';
      element.replaceChildren(img);
    };
    element.appendChild(img);
    img.src = src;
    return true;
  }
  window.SteelCardAssets = { init, get, apply, isReady:()=>ready, aliases };
})();