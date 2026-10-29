
document.addEventListener('DOMContentLoaded', function(){
  const root=document.documentElement;
  const toggle=document.querySelector('.product-international-toggle');
  const languageSelect=document.querySelector('.product-language-select');
  const darkToggle=document.querySelector('[data-products-dark-toggle]');
  const languageBlocks=[...document.querySelectorAll('[data-copy-lang]')];
  const priceEls=[...document.querySelectorAll('[data-price-id][data-price-usd]')];
  const ctas=[...document.querySelectorAll('.commerce-checkout-btn')];
  const INTERNATIONAL_ACTIVE_PRODUCTS=new Set(['website-course','website-development','digital-ads-management','digital-marketing-ebooks']);
  let regularLanguage='id';

  function setCopyLanguage(lang){
    const selected=lang==='en'?'en':'id';
    root.lang=selected;
    languageBlocks.forEach(el=>{el.hidden=el.dataset.copyLang!==selected;});
    if(languageSelect) languageSelect.value=selected;
  }

  function applyTheme(theme,persist=true){
    const selected=theme==='dark'?'dark':'light';
    root.dataset.productsTheme=selected;
    if(darkToggle){
      const active=selected==='dark';
      darkToggle.setAttribute('aria-pressed',String(active));
      darkToggle.setAttribute('aria-label',active?'Disable dark mode':'Enable dark mode');
      darkToggle.setAttribute('title',active?'Switch to Light':'Switch to Dark');
    }
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',selected==='light'?'#f6f7f9':'#07111f');
    if(persist){
      try{localStorage.setItem('maulCommerceDarkMode',String(selected==='dark'));}catch(_){ }
    }
  }

  function productName(card){
    const title=card?.querySelector('h2:not([hidden])') || card?.querySelector('h2');
    return title ? title.textContent.replace(/\s+/g,' ').trim() : 'a product';
  }
  function productId(card){return card?.dataset.productId||'';}
  function isInternationalActive(card){return INTERNATIONAL_ACTIVE_PRODUCTS.has(productId(card));}
  ctas.forEach(cta=>{
    cta.dataset.originalDisabled=cta.disabled?'true':'false';
    cta.dataset.originalClass=cta.className;
    if(cta.tagName==='A') cta.dataset.originalHref=cta.getAttribute('href')||'';
    const idSpan=cta.querySelector('[data-copy-lang="id"]');
    const enSpan=cta.querySelector('[data-copy-lang="en"]');
    if(idSpan) idSpan.dataset.originalText=idSpan.textContent;
    if(enSpan) enSpan.dataset.originalText=enSpan.textContent;
  });

  function applyInternational(active,persist=true){
    root.dataset.international=active?'true':'false';
    toggle?.setAttribute('aria-pressed',String(active));
    if(active){
      regularLanguage=root.lang==='en'?'en':'id';
      setCopyLanguage('en');
      if(languageSelect){
        const idOption=languageSelect.querySelector('option[value="id"]');
        if(idOption) idOption.disabled=true;
      }
    }else{
      const idOption=languageSelect?.querySelector('option[value="id"]');
      if(idOption) idOption.disabled=false;
      setCopyLanguage(regularLanguage);
    }
    priceEls.forEach(el=>{el.textContent=active?el.dataset.priceUsd:el.dataset.priceId;});
    document.querySelectorAll('.international-payment-support').forEach(el=>{el.hidden=!active;});

    ctas.forEach(cta=>{
      const card=cta.closest('.commerce-product-card');
      const idSpan=cta.querySelector('[data-copy-lang="id"]');
      const enSpan=cta.querySelector('[data-copy-lang="en"]');
      if(active){
        if(isInternationalActive(card)){
          cta.disabled=false;
          cta.classList.remove('is-coming-soon','international-unavailable','international-whatsapp');
          cta.classList.add('is-ready');
          cta.removeAttribute('aria-disabled');
          if(cta.tagName==='A') cta.setAttribute('href',cta.dataset.originalHref||card?.dataset.detailUrl||'#');
          if(idSpan&&idSpan.dataset.originalText) idSpan.textContent=idSpan.dataset.originalText;
          if(enSpan&&enSpan.dataset.originalText) enSpan.textContent=enSpan.dataset.originalText;
        }else{
          cta.disabled=true;
          cta.classList.remove('is-ready','international-whatsapp');
          cta.classList.add('is-coming-soon','international-unavailable');
          if(cta.tagName==='A'){cta.removeAttribute('href');cta.setAttribute('aria-disabled','true');}
          if(enSpan) enSpan.textContent='Not available internationally';
          if(idSpan) idSpan.textContent='Belum tersedia untuk International';
        }
      }else{
        cta.className=cta.dataset.originalClass||cta.className;
        cta.disabled=cta.dataset.originalDisabled==='true';
        cta.removeAttribute('aria-disabled');
        if(cta.tagName==='A') cta.setAttribute('href',cta.dataset.originalHref||'#');
        if(idSpan&&idSpan.dataset.originalText) idSpan.textContent=idSpan.dataset.originalText;
        if(enSpan&&enSpan.dataset.originalText) enSpan.textContent=enSpan.dataset.originalText;
      }
    });
    try{
      localStorage.setItem('maulProductsInternational',String(active));
      localStorage.setItem('maulCourseInternational',String(active));
      if(active) localStorage.setItem('maulCommerceLanguage','en');
    }catch(_){ }
  }

  languageSelect?.addEventListener('change',function(){
    if(root.dataset.international==='true' && this.value==='id'){this.value='en';return;}
    regularLanguage=this.value==='en'?'en':'id';
    setCopyLanguage(regularLanguage);
    try{localStorage.setItem('maulCommerceLanguage',regularLanguage);}catch(_){ }
  });
  darkToggle?.addEventListener('click',function(){applyTheme(root.dataset.productsTheme==='dark'?'light':'dark',true);});
  toggle?.addEventListener('click',()=>applyInternational(root.dataset.international!=='true',true));

  try{
    const savedLang=localStorage.getItem('maulCommerceLanguage');
    regularLanguage=savedLang==='en'?'en':'id';
  }catch(_){ }
  applyTheme(root.dataset.productsTheme==='dark'?'dark':'light',false);
  const active=root.dataset.international==='true';
  setCopyLanguage(regularLanguage);
  applyInternational(active,false);
});
