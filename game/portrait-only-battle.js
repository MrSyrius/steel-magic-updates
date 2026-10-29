/* TEST 17.6: remove legacy emoji text behind approved unit portraits.
   Presentation only; never changes battle logic, geometry or unit state. */
(() => {
  'use strict';
  const style = document.createElement('style');
  style.id = 'sm-single-portrait-battle';
  style.textContent = [
    '#battleField .fighter .ficon:has(> img.fighter-portrait) { font-size:0!important; line-height:0!important; visibility:visible!important; }',
    '#battleField .fighter .ficon > img.fighter-portrait { display:block!important; visibility:visible!important; }',
    '#board .unit .icon:has(> img.unit-portrait) { font-size:0!important; line-height:0!important; visibility:visible!important; }',
    '#board .unit .icon > img.unit-portrait { visibility:visible!important; }'
  ].join('\n');
  document.head.appendChild(style);
})();
