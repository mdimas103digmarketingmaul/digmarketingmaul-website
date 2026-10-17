(function(){
  function syncControls(){
    const root=document.documentElement;
    const lang=root.dataset.language || root.lang || 'id';
    const theme=root.dataset.articleTheme || root.dataset.theme || 'light';
    document.querySelectorAll('[data-maul-language-select]').forEach(function(select){select.value=lang==='en'?'en':'id';});
    document.querySelectorAll('[data-maul-theme-select]').forEach(function(select){select.value=theme==='dark'?'dark':'light';});
  }

  function applyLanguage(value){
    const next=value==='en'?'en':'id';
    if(window.MauldigitalUI && typeof window.MauldigitalUI.applyLanguage==='function'){
      window.MauldigitalUI.applyLanguage(next);
    }else{
      const legacy=document.querySelector('.language-btn[data-language="'+next+'"]');
      if(legacy) legacy.click();
    }
    syncControls();
  }

  function applyTheme(value){
    const next=value==='dark'?'dark':'light';
    if(window.MauldigitalUI && typeof window.MauldigitalUI.applyTheme==='function'){
      window.MauldigitalUI.applyTheme(next);
    }else{
      const legacy=document.querySelector('.theme-btn[data-theme="'+next+'"]');
      if(legacy) legacy.click();
    }
    syncControls();
  }

  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('[data-maul-language-select]').forEach(function(select){
      select.addEventListener('change',function(){applyLanguage(select.value);});
    });
    document.querySelectorAll('[data-maul-theme-select]').forEach(function(select){
      select.addEventListener('change',function(){applyTheme(select.value);});
    });
    syncControls();
    document.addEventListener('commerce-language-change',syncControls);
  });
})();
