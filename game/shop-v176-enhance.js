/* Steel & Magic TEST 17.6: shop artwork and presentation adapter. */
(function(){
 'use strict';
 const chests={
  'BRĄZOWA':{id:'bronze',name:'Skrzynia brązowa',text:'Złoto: 50–100. Zwykłe fragmenty: 3–5. Magiczny fragment: 1.'},
  'SREBRNA':{id:'silver',name:'Skrzynia srebrna',text:'Złoto: 100–175. Zwykłe fragmenty: 9–15. Magiczne fragmenty: 3–5. Epickie fragmenty: 1–2.'},
  'ZŁOTA':{id:'gold',name:'Skrzynia złota',text:'Złoto: 250–350. Zwykłe fragmenty: 15–20. Magiczne fragmenty: 5–10. Epickie fragmenty: 3–5.'}
 };
 window.smShopChestInfo=function(kind){
  const item=Object.values(chests).find(c=>c.id===kind);
  if(item)info(item.name,item.text+' Szczegółowe warunki odblokowań zależą od kolekcji i dywizji. Zakupy i odbiór nagród nie są jeszcze podłączone do konta.');
 };
 function decorate(){
  const shop=document.getElementById('shopbody');
  if(!shop)return;
  for(const card of shop.querySelectorAll('.sm-shop-tile')){
   const title=card.querySelector('.sm-shop-tile-title');
   const item=title&&chests[title.textContent.trim()];
   if(!item)continue;
   const art=card.querySelector('.sm-shop-illustration');
   if(art&&!art.querySelector('img')){
    const image=document.createElement('img');
    image.src='/game/shop-assets/chest-'+item.id+'.svg';
    image.alt=item.name;
    image.loading='lazy';
    image.decoding='async';
    art.replaceChildren(image);
   }
   const action=card.querySelector('.sm-shop-buy');
   if(action&&action.dataset.chest!==item.id){
    action.dataset.chest=item.id;
    action.setAttribute('onclick',"smShopChestInfo('"+item.id+"')");
    action.textContent='ZAWARTOŚĆ';
   }
  }
  const season=shop.querySelector('.sm-season-grid');
  if(season&&!season.dataset.decorated){
   season.dataset.decorated='true';
   season.querySelectorAll('.sm-season-day').forEach((day,i)=>{
    day.setAttribute('aria-label','Dzień '+(i+1)+' kalendarza sezonowego');
    if((i+1)%7===0)day.classList.add('smv-season-milestone');
   });
   const heading=shop.querySelector('.sm-season-header');
   if(heading&&!heading.querySelector('.smv-season-note')){
    const note=document.createElement('p');
    note.className='smv-season-note';
    note.textContent='Podgląd 30-dniowego kalendarza. Daty i nagrody sezonu wymagają zatwierdzenia.';
    heading.append(note);
   }
  }
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const body=document.getElementById('shopbody');
  if(!body)return;
  decorate();
  new MutationObserver(decorate).observe(body,{childList:true});
 });
})();
