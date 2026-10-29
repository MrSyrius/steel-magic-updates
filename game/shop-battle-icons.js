/* TEST 17.6: display approved shop WebP icons only inside the battle shop.
   No changes to unit sprites, placement, shop selection, or battle logic. */
(() => {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const assets = new Map();
  const aliases = {
    sword:'miecznik',pik:'pikinier',archer:'lucznik',sapper:'saper',bannerbearer:'chorazy',
    knight:'rycerz',treasurer:'skarbnik',cav:'kawaleria',runemage:'mag_runiczny',
    inquisitor:'inkwizytor',cat:'katapulta',priest:'kaplanka',paladin:'paladyn_kobieta',
    swordmaster:'mistrz_miecza',general:'general',axe:'topornik_mroku',
    cultist:'kultysta',reaper:'zniwiarz_mroku',assassin:'zabojczyni_mroku',
    darkspearman:'oszczepniczka_mroku',cross:'kusznik_mroku',alch:'alchemiczka_mroku',
    shadowhunter:'lowca_cieni',vampire:'wampir_mroku',shadowmage:'czarownica_cieni',
    mage:'mag_mroku',necromancer:'nekromanta',golem:'golem_mroku',
    demon:'demon_mroku',executioner:'egzekutor_mroku',dog:'pies_bestie',
    snake:'waz_bestie',slasher:'szarpak_bestie',spider_web:'pajak_bestie',
    goblin:'goblin_bestie',wolf:'wilk_bestie',basilisk:'bazyliszek_bestie',
    troll:'troll_bestie',ogre:'ogr_bestie',ent:'ent_bestie',bear:'niedzwiedz_bestie',
    hydra:'hydra_bestie',kraken:'kraken_bestie',woodwarden:'borowy_bestie',
    mantis:'modliszka_bestie'
  };
  let observer;
  function apply() {
    const shop = document.getElementById('shop');
    if (!shop || !assets.size) return;
    for (const item of shop.querySelectorAll('.shopItem')) {
      const name = item.querySelector('.shop-item-name');
      const icon = item.querySelector('.icon');
      if (!name || !icon) continue;
      const src = assets.get(normalize(name.textContent));
      if (!src || icon.dataset.smShopIcon === src) continue;
      icon.style.backgroundImage = 'url("' + src + '")';
      icon.style.backgroundPosition = 'center';
      icon.style.backgroundSize = 'contain';
      icon.style.backgroundRepeat = 'no-repeat';
      icon.dataset.smShopIcon = src;
    }
  }
  async function init() {
    try {
      const response = await fetch('/game/cards/deck_assets.json', {cache:'no-store'});
      if (!response.ok) return;
      const manifest = await response.json();
      if (!Array.isArray(manifest.units)) return;
      for (const unit of manifest.units) {
        if (!unit.name || !/^cards\/shop-icons\/[a-z0-9_-]+\.webp$/.test(unit.shopIcon || '')) continue;
        assets.set(normalize(unit.id), '/game/' + unit.shopIcon);
      }
      if (typeof engineUnits !== 'undefined') for (const [id, name] of engineUnits) {
        const src = assets.get(normalize(aliases[id] || id));
        if (src) assets.set(normalize(name), src);
      }
      assets.set(normalize('Mag Runiczny'), '/game/cards/shop-icons/mag-runiczny.webp');
      const shop = document.getElementById('shop');
      if (!shop) return;
      // Batch multiple shop mutations into one paint-cycle update.
      let scheduled = false;
      observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; apply(); });
      });
      observer.observe(shop, {childList:true});
      apply();
    } catch (error) {
      console.warn('Shop icon assets unavailable', error);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
