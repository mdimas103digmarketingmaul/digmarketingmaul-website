(function(){
  const root=document.documentElement;
  const INTERNATIONAL_KEY='maulProductsInternational';
  const config=window.MaulProductInternationalConfig||{};
  const toggle=document.querySelector('[data-product-international-toggle]');
  const languageSelect=document.querySelector('[data-maul-language-select]');
  const prices=[...document.querySelectorAll('[data-price-id][data-price-usd]')];
  const internationalCtas=[...document.querySelectorAll('[data-international-cta]')];
  const amountCopies=[...document.querySelectorAll('[data-amount-id][data-amount-usd]')];
  let regularLanguage=root.dataset.language==='en'?'en':'id';

  function setLanguage(language){
    const next=language==='en'?'en':'id';
    if(window.MauldigitalUI&&typeof window.MauldigitalUI.applyLanguage==='function'){
      window.MauldigitalUI.applyLanguage(next,true);
    }else{
      root.dataset.language=next;
      root.lang=next;
    }
    if(languageSelect) languageSelect.value=next;
  }

  function updateCta(cta,active){
    if(!cta.dataset.localHref) cta.dataset.localHref=cta.getAttribute('href')||'';
    if(active){
      cta.setAttribute('href',config.whatsappUrl||cta.dataset.localHref);
      cta.setAttribute('target','_blank');
      cta.setAttribute('rel','noopener noreferrer');
      cta.classList.add('international-whatsapp-cta');
    }else{
      cta.setAttribute('href',cta.dataset.localHref||'#');
      cta.removeAttribute('target');
      cta.removeAttribute('rel');
      cta.classList.remove('international-whatsapp-cta');
    }
  }

  function applyInternational(active,persist=true){
    root.dataset.international=active?'true':'false';
    toggle?.setAttribute('aria-pressed',String(active));

    if(active){
      regularLanguage=root.dataset.language==='en'?'en':'id';
      setLanguage('en');
      const idOption=languageSelect?.querySelector('option[value="id"]');
      if(idOption) idOption.disabled=true;
    }else{
      const idOption=languageSelect?.querySelector('option[value="id"]');
      if(idOption) idOption.disabled=false;
      setLanguage(regularLanguage);
    }

    prices.forEach(el=>{el.textContent=active?el.dataset.priceUsd:el.dataset.priceId;});
    amountCopies.forEach(el=>{el.textContent=active?el.dataset.amountUsd:el.dataset.amountId;});
    internationalCtas.forEach(cta=>updateCta(cta,active));

    if(persist){
      try{localStorage.setItem(INTERNATIONAL_KEY,String(active));}catch(_){ }
    }
  }

  toggle?.addEventListener('click',()=>applyInternational(root.dataset.international!=='true',true));
  languageSelect?.addEventListener('change',function(){
    if(root.dataset.international==='true'&&this.value==='id'){
      this.value='en';
      setLanguage('en');
    }
  });

  let active=false;
  try{active=localStorage.getItem(INTERNATIONAL_KEY)==='true';}catch(_){active=root.dataset.international==='true';}
  applyInternational(active,false);
})();
